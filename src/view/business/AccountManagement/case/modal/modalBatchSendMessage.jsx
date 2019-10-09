import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button, message, Form, Input, Select} from 'antd';
import Api from '@/api/index';
import baseConfig from '@/assets/js/config';
import Cookies from 'js-cookie';

const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea} = Input;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

// 批量发送短信 模板配置 弹框
class AddModal extends Component {
    constructor (props) {
        super(props);
        const {tip} = baseConfig;
        this.state = {
            btnLoading: false,
            selectedTemplate: null
        };
        this.tip = tip;
    }

    // 确定
    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                let repaymentIdArr = [];
                this.props.selectedRows.forEach(item => {
                    repaymentIdArr.push(item.repaymentId)
                });
                this.setState({btnLoading: true});
                const data = await Api('post', {
                    serviceUrl: 'sms'
                }, {
                    createdby: Cookies.get('un'),
                    repaymentId: repaymentIdArr.toString(),
                    tmplId: value.tmplId
                });
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
    modalCancel () {
        this.props.onCancel();
        this.props.form.resetFields();
    }

    onChange (value) {
        const selected = this.props.messageTemplateList.filter((item) => {
            return item.id === value;
        });
        this.setState({
            selectedTemplate: selected
        }, () => {
            this.props.form.setFieldsValue({
                tmplContent: this.state.selectedTemplate[0].tmplContent,
            });
        });
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {btnLoading} = this.state;
        const {openModal, messageTemplateList} = this.props;
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
                    title="批量发送短信"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk.bind(this)}
                    onCancel={this.modalCancel.bind(this)}
                    width={450}
                    footer={[
                        <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                        <Button key="submit" type="primary" loading={btnLoading} onClick={this.modalOk.bind(this)}>确定</Button>
                    ]}>
                    <Form>
                        <FormItem label="模板名称" {...labelConfig}>
                            {getFieldDecorator('tmplId', {
                                rules: [{required: true, message: '请选择短信模板'}],
                            })(
                                <Select
                                    showSearch
                                    style={{width: 300}}
                                    placeholder="请选择短信模板"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    onChange={this.onChange.bind(this)}
                                >
                                    {messageTemplateList.map((item) => {
                                        return (
                                            <Option key={item.id} value={item.id}>{item.tmplName}</Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="模板内容" {...labelConfig}>
                            {getFieldDecorator('tmplContent', {})(
                                <TextArea style={{width: 300}} autosize={{minRows: 6, maxRows: 6}} disabled={true}/>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
    }
}

AddModal = Form.create()(AddModal);

export default connect(mapStateToProps, mapDispatchToProps)(AddModal);
