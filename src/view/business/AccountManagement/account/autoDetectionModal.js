import React, {Component} from 'react';
import {Modal, Button, message, Form, Checkbox} from 'antd';
import Api from '@/api/index';
import baseConfig from '@/assets/js/config';

const FormItem = Form.Item;

// 批量失联探测弹框
class AddModal extends Component {
    constructor (props) {
        super(props);
        const {tip} = baseConfig;
        this.state = {
            btnLoading: false,
            templateList: []
        };
        this.tip = tip;
    }

    // 确定
    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                const {selectedRows} = this.props;
                const idArr = [];
                selectedRows.forEach(item => {
                    if(!idArr.includes(item.borrowerId)) {
                        idArr.push(item.borrowerId)
                    }
                });
                let params = {...value};
                params.detectSelfDefault = params.target.indexOf(1) > -1 ? 1 : 0;
                params.detectSelfOther = params.target.indexOf(2) > -1 ? 1 : 0;
                params.detectOtherContact = params.target.indexOf(3) > -1 ? 1 : 0;
                params.borrowerId = idArr.toString();
                delete params.target;
                this.setState({btnLoading: true});
                const data = await Api('post', 'detect', {
                    ...params
                });
                this.setState({btnLoading: false});
                if (data.success) {
                    message.success(this.tip.operateSuccess);
                    this.props.onOk('true');
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

    onChange (checkedValue) {
        console.log(checkedValue);
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {btnLoading} = this.state;
        const {openModal} = this.props;

        const labelConfig = {
            labelCol: {span: 10},
            wrapperCol: {span: 14},
            style: {
                width: '100%',
                marginRight: '0',
                display: 'inline-block'
            }
        };
        const plainOptions = [{
            label: '本人默认手机',
            value: 1
        }, {
            label: '本人其他手机',
            value: 2
        }, {
            label: '其他联系人手机',
            value: 3
        }];
        return (
            <div>
                <Modal
                    title="批量失联探测"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk.bind(this)}
                    onCancel={this.modalCancel.bind(this)}
                    width={250}
                    footer={[
                        <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                        <Button key="submit" type="primary" loading={btnLoading} onClick={this.modalOk.bind(this)}>确定</Button>
                    ]}>
                    <Form style={{position: 'relative'}} id="autoDetectionModal">
                        <FormItem label="探测目标" {...labelConfig}>
                            {getFieldDecorator('target', {
                                initialValue: [1],
                                rules: [{required: true, message: '请选择探测目标'}],
                            })(
                                <Checkbox.Group options={plainOptions} onChange={this.onChange.bind(this)} style={{width: '120px'}}/>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
    }
}

AddModal = Form.create()(AddModal);

export default AddModal;
