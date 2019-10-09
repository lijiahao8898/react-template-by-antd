import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button, message, Form, Select, Radio, Input} from 'antd';
// tool
import Cookies from 'js-cookie';
import {autobind} from 'core-decorators';
import {tip, regular} from '@/assets/js/config';
import Api from '@/api/index';

const FormItem = Form.Item;
const Option = Select.Option;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

// 模板配置弹框
@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class AddModal extends Component {
    constructor (props) {
        super(props);
        this.state = {
            btnLoading: false,
        };
        this.tip = tip;
    }

    // 确定
    @autobind
    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                let params = {...value};
                let data = null;
                this.setState({btnLoading: true});
                if (this.props.currentRecord && this.props.currentRecord.id) {
                    data = await Api('put', 'updateCustomerBank', {
                        createby: Cookies.get('un'),
                        bankCardId: this.props.currentRecord.id,
                        ...params
                    });
                } else {
                    // 添加
                    data = await Api('post', 'addCustomerBank', {
                        createby: Cookies.get('un'),
                        borrowerId: this.props.borrowerId,
                        ...params
                    });
                }
                this.setState({btnLoading: false});
                if (data.success) {
                    message.success(this.tip.operateSuccess);
                    this.props.onOk();
                }
                this.modalCancel();
            }
        });
    }

    // 取消
    @autobind
    modalCancel () {
        this.props.onCancel();
        this.props.form.resetFields();
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {btnLoading} = this.state;
        const {openModal, currentRecord} = this.props;
        const {bankList} = this.props.state.statusItemList;
        const labelConfig = {
            labelCol: {span: 5},
            wrapperCol: {span: 19},
            style: {
                width: '100%',
                marginRight: '0',
                display: 'inline-block'
            }
        };

        return (
            <div>
                <Modal
                    title="银行卡"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk}
                    onCancel={this.modalCancel}
                    width={450}
                    footer={[
                        <Button key="back" onClick={this.modalCancel}>取消</Button>,
                        <Button key="submit" type="primary" loading={btnLoading} onClick={this.modalOk}>确定</Button>
                    ]}>
                    <Form style={{position: 'relative'}} id="autoDetectionModal">

                        <FormItem label="账号" {...labelConfig}>
                            {getFieldDecorator('khbankcode', {
                                initialValue: currentRecord ? currentRecord.kHBankCode : null,
                                rules: [{required: true, message: '请输入账号'}],
                            })(
                                <Input type='text' style={{width: 280}}/>
                            )}
                        </FormItem>

                        <FormItem label="银行" {...labelConfig}>
                            {getFieldDecorator('bank', {
                                initialValue: currentRecord ? (currentRecord.bank).toString() : null,
                                rules: [{required: true, message: '请选择银行'}],
                            })(
                                <Select
                                    showSearch
                                    style={{width: 280}}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {bankList.map((item) => {
                                        return (
                                            <Option key={item.code} value={item.code}>{item.name}</Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>

                        <FormItem label="预留手机" {...labelConfig}>
                            {getFieldDecorator('yuliumobile', {
                                initialValue: currentRecord ? currentRecord.yuLiuMobile : null,
                                rules: [
                                    {required: true, message: '请输入预留手机'},
                                    {pattern: regular.phone, message: '预留手机号格式不正确'}
                                ],
                            })(
                                <Input type='text' style={{width: 280}}/>
                            )}
                        </FormItem>

                        <FormItem label="是否代扣卡" {...labelConfig}>
                            <Radio defaultChecked disabled={true}>否</Radio>
                        </FormItem>

                    </Form>
                </Modal>
            </div>
        );
    }
}

AddModal = Form.create()(AddModal);

export default connect(mapStateToProps, mapDispatchToProps)(AddModal);
