import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button, message, Form, Input, Alert} from 'antd';
import Api from '@/api/index';
import baseConfig from '@/assets/js/config';
import Cookies from 'js-cookie';

const FormItem = Form.Item;
const {TextArea} = Input;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

// 模板配置弹框
class AddModal extends Component {
    constructor (props) {
        super(props);
        const {tip, modalWidth} = baseConfig;
        this.state = {
            btnLoading: false,
        };
        this.tip = tip;
        this.modalWidth = modalWidth.small;
    }

    // 确定
    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                this.setState({btnLoading: true});
                let data = null;
                if (this.props.currentRecord.id) {
                    // 修改
                    data = await Api('put', {
                        serviceUrl: `sms/templates/${this.props.currentRecord.id}`
                    }, {
                        modifiedby: Cookies.get('un'),
                        ...value
                    });
                } else {
                    data = await Api('post', 'getSmsTemplates', {
                        modifiedby: Cookies.get('un'),
                        ...value
                    });
                }
                this.setState({btnLoading: false});
                if (data.success) {
                    message.success(this.tip.operateSuccess);
                    this.props.onOk('true');
                    this.modalCancel();
                }
            }
        });
    }

    // 取消
    modalCancel () {
        this.props.onCancel();
        this.props.form.resetFields();
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {btnLoading} = this.state;
        const {openModal, currentRecord} = this.props;
        const labelConfig = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
            style: {
                width: '100%',
                marginRight: '0',
                display: 'inline-block'
            }
        };

        return (
            openModal && <div>
                <Modal
                    title="模板配置"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk.bind(this)}
                    onCancel={this.modalCancel.bind(this)}
                    width={this.modalWidth}
                    footer={[
                        <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                        <Button key="submit" type="primary" loading={btnLoading} onClick={this.modalOk.bind(this)}>确定</Button>
                    ]}>
                    <Form>
                        <FormItem label="模板名称" {...labelConfig}>
                            {getFieldDecorator('tmplName', {
                                initialValue: currentRecord.tmplName,
                                rules: [{required: true, message: '请输入模板名称'}],
                            })(
                                <Input placeholder="请输入模板名称" maxLength={30}/>
                            )}
                        </FormItem>
                        <FormItem label="模板内容" {...labelConfig}>
                            {getFieldDecorator('tmplContent', {
                                initialValue: currentRecord.tmplContent,
                                rules: [{
                                    required: true, message: '请输入模板内容'
                                }, {
                                    pattern: /^[^【】[\]]*$/, message: '模板内容不能输入【】[]'
                                }],
                            })(
                                <TextArea placeholder="请输入模板内容" maxLength={500} autosize={{minRows: 6, maxRows: 6}}/>
                            )}
                        </FormItem>
                    </Form>
                    <Alert type="error"
                           description={
                               <div style={{color: '#f5222d'}}>
                                   <div>模板占位符：</div>
                                   <div>$name$借款人姓名，$date$还款日期，$amount$预计还款金额，$bankCard$银行卡号（后四位），$bankName$银行名称，$overDueAmount$历史未还款总金额，$payOffAmount$产品结清总金额</div>
                                   <div>仅签约代扣协议的客户可使用包含“银行卡号”、“银行名称”字段信息的短信模板，否则短信将发送失败</div>
                               </div>
                           }>
                    </Alert>
                </Modal>
            </div>
        );
    }
}

AddModal = Form.create()(AddModal);

export default connect(mapStateToProps, mapDispatchToProps)(AddModal);