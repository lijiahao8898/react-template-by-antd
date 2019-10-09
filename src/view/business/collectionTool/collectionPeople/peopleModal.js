import React, {Component} from 'react';
import {Button, message, Modal, Form} from 'antd';
import PropTypes from 'prop-types';
import {autobind} from 'core-decorators';
import Api from '@/api';
// tool
import {trim} from '@/assets/js/common';
import {regular, tip, textMap} from '@/assets/js/config';
// component
import JycInput from '@/component/jycInput';

const FormItem = Form.Item;

class PeopleModal extends Component {
    static defaultProps = {
        operateType: 1,
        openModal: false,
        record: {}
    };
    static propTypes = {
        operateType: PropTypes.number.isRequired,
        openModal: PropTypes.bool.isRequired,
        record: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        onOk: PropTypes.func.isRequired
    };

    constructor (props) {
        super(props);
        this.state = {
            isAjax: false,
            userMobile: null,
            isRegister: false
        };
    }

    // 确定
    @autobind
    async modalOk () {
        const {operateType, record} = this.props;
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                this.setState({
                    isAjax: true,
                });
                const params = {
                    dingdingNum: trim(value.dingdingNum),
                    trackerMobile: trim(value.trackerMobile),
                    trackerName: trim(value.trackerName)
                };
                if (operateType === 1) {
                    const add = await Api('POST', 'addTracker', {...params});
                    if (add.success) {
                        message.success(`新增催服专员【${value.trackerName}】成功！`);
                        this.props.onOk();
                        this.modalCancel();
                    }
                } else {
                    const update = await Api('PUT', 'updateTracker', {
                        id: record.id,
                        ...params
                    });
                    if (update.success) {
                        message.success(`修改催服专员【${value.trackerName}】成功！`);
                        this.props.onOk();
                        this.modalCancel();
                    }
                }
                this.setState({
                    isAjax: false,
                });
            }
        });
    }

    // 取消
    @autobind
    modalCancel () {
        this.props.onCancel();
        this.props.form.resetFields();
        this.setState({
            isAjax: false,
            userMobile: null,
            isRegister: false
        });
    }

    @autobind
    handleMobileChange (e) {
        this.props.form.setFieldsValue({
            dingdingNum: e.target.value
        });
        this.setState({
            userMobile: e.target.value
        });
    }

    @autobind
    async handleRefreshUserInfo (phone) {
        const userMobile = phone || this.state.userMobile;
        if(!userMobile) {
            message.info('请填写手机号码！');
            return
        }
        const data = await Api('GET', 'getTrackerAuth', {
            mobile: userMobile
        });
        if (data.success) {
            message.success(tip.operateSuccess);
            this.setState({
                isRegister: data.datas.content === 1
            });
        }
    }

    render () {
        const {openModal, operateType, record, form} = this.props;
        let {isAjax, isRegister} = this.state;
        const {getFieldDecorator} = form;
        const labelConfig = {
            labelCol: {span: 7},
            wrapperCol: {span: 17},
            style: {
                width: '100%',
                marginRight: '0',
                display: 'inline-block'
            }
        };
        const width = 250;

        // 如果列表有那就取值列表的，如果没有就用state
        if(record.authStatus) {
            isRegister = (record.authStatus === 1)
        }

        return (

            <Modal
                title={operateType === 1 ? '新增催服专员' : '修改催服专员'}
                maskClosable={false}
                centered={true}
                visible={openModal}
                onOk={this.modalOk}
                onCancel={this.modalCancel}
                width="400px"
                footer={[
                    <Button key="back" onClick={this.modalCancel}>{textMap.cancel}</Button>,
                    <Button key="submit"
                            type="primary"
                            loading={isAjax}
                            onClick={this.modalOk}
                            disabled={isAjax}>{textMap.ok}</Button>
                ]}>
                <Form>
                    <FormItem label='专员名称' {...labelConfig}>
                        {getFieldDecorator('trackerName', {
                            rules: [{
                                required: true, message: '请输入专员名称'
                            }],
                            initialValue: operateType === 2 ? record.trackerName : null
                        })(
                            <JycInput type='text' style={{width: width}}/>
                        )}
                    </FormItem>
                    <FormItem label='联系手机' {...labelConfig}>
                        {getFieldDecorator('trackerMobile', {
                            rules: [{
                                required: true, message: '请输入联系手机',
                            }, {
                                pattern: regular.phone, message: tip.formatError
                            }],
                            initialValue: operateType === 2 ? record.trackerMobile : null
                        })(
                            <JycInput type='text' style={{width: width}} onChange={this.handleMobileChange}/>
                        )}
                    </FormItem>
                    <FormItem label='钉钉账号' {...labelConfig}>
                        {getFieldDecorator('dingdingNum', {
                            rules: [{
                                required: true, message: '请输入钉钉账号'
                            }],
                            initialValue: operateType === 2 ? record.dingdingNum : null
                        })(
                            <JycInput type='text' style={{width: width}}/>
                        )}
                    </FormItem>
                    <FormItem label='用户中心已注册' {...labelConfig}>
                        <span>{(isRegister) ? '是' : '否'}
                            <Button type='primary' ghost size='small' className='m-l-md' onClick={() => this.handleRefreshUserInfo(record.trackerMobile)}>刷新</Button>
                        </span>
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(PeopleModal);
