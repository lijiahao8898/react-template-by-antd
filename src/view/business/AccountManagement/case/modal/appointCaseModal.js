import React, {Component} from 'react';
import {Button, message, Modal, Form, Select, Radio, Input} from 'antd';
import Api from '@/api/index';
import Cookies from 'js-cookie';

const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea} = Input;

class EditModal extends Component {
    constructor (props) {
        super(props);
        this.state = {
            openEditHistoryModal: false,
            isAjax: false
        };
    }

    // 确定
    async modalOk () {
        const {selectedRows} = this.props;
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                this.setState({isAjax: true});
                const data = await Api('PUT', 'updateCasesEntrustStatus', {
                    id: selectedRows[0].id,
                    ...value
                });
                this.setState({isAjax: false});
                if (data.success) {
                    message.success(`更改【${selectedRows[0].caseNum}】委案状态成功！`);
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

    render () {
        const {isAjax} = this.state;
        const {openModal, selectedRows} = this.props;
        const {getFieldDecorator} = this.props.form;
        const labelConfig = {
            labelCol: {span: 5},
            wrapperCol: {span: 19},
            style: {
                width: '100%',
                marginRight: '0',
                display: 'inline-block'
            }
        };

        const width = 250;

        return (
            <Modal
                title="变更委案状态"
                maskClosable={false}
                centered={true}
                visible={openModal}
                onOk={this.modalOk.bind(this)}
                onCancel={this.modalCancel.bind(this)}
                width="450px"
                footer={[
                    <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                    <Button key="submit"
                            type="primary"
                            loading={isAjax}
                            onClick={this.modalOk.bind(this)}>{'确定'}</Button>
                ]}>
                <div>
                    <Form>
                        <FormItem label='委案状态' {...labelConfig}>
                            {getFieldDecorator('entrustStatus', {
                                initialValue: selectedRows.length > 0 && selectedRows[0].entrustStatus ? selectedRows[0].entrustStatus : null
                            })(
                                <Radio.Group>
                                    <Radio value={1}>受理中</Radio>
                                    <Radio value={2}>已核销</Radio>
                                </Radio.Group>
                            )}
                        </FormItem>
                        <FormItem label='案件备注' {...labelConfig}>
                            {getFieldDecorator('remark', {
                                initialValue: selectedRows.length > 0 && selectedRows[0].remark ? selectedRows[0].remark : null
                            })(
                                <TextArea style={{width: width}} autosize={{minRows: 6, maxRows: 6}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
}

export default Form.create()(EditModal);
