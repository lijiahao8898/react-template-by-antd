import React, {Component} from 'react';
import {Modal, Button, message, Form, Input} from 'antd';
import Api from '@/api/index';
import {toThousands} from '@/assets/js/common';
import baseConfig from '@/assets/js/config';

const FormItem = Form.Item;

// 罚息减免
class PenaltyAmountModal extends Component {
    constructor (props) {
        super(props);
        this.state = {
            submitLoading: false
        }
    }

    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                this.setState({submitLoading: true});
                const data = await Api('put', 'updatePenaltyAmount', {
                    repaymentId: this.props.selectedRows[0].repaymentId,
                    penaltyAmount: value.penaltyAmount
                });
                this.setState({submitLoading: false});
                if (data.success) {
                    message.success(baseConfig.tip.operateSuccess);
                    this.props.onOk('true');
                }
                this.modalCancel()
            }
        });
    }

    modalCancel () {
        this.props.form.resetFields();
        this.props.onCancel();
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const penaltyAmount = this.props.selectedRows.length > 0 ? this.props.selectedRows[0].penaltyAmount : 0;
        const {openModal} = this.props;
        const {modalWidth, tip, regular, inputWidth} = baseConfig;

        const labelConfig = {
            labelCol: {
                span: 5
            },
            wrapperCol: {
                span: 8
            },
            style: {
                width: '350px',
                marginRight: '0',
                display: 'inline-block'
            }
        };

        const {submitLoading} = this.state;
        return (
            <Modal
                title="罚息减免"
                maskClosable={false}
                visible={openModal}
                onOk={this.modalOk.bind(this)}
                onCancel={this.modalCancel.bind(this)}
                width={modalWidth.extraExtraSmall}
                footer={[
                    <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                    <Button key="submit" type="primary" loading={submitLoading} onClick={this.modalOk.bind(this)}>确定</Button>
                ]}>
                <Form>
                    <FormItem label="原罚息" {...labelConfig}>
                        <div>{toThousands(penaltyAmount) || 0}</div>
                    </FormItem>
                    <FormItem label="新罚息" {...labelConfig}>
                        {getFieldDecorator('penaltyAmount', {
                            rules: [{
                                required: true, message: '请输入新罚息'
                            }, {
                                pattern: regular.decimal, message: tip.formatError
                            }],
                        })(
                            <Input type="text" placeholder="请输入新罚息" style={{width: inputWidth.tiny}}/>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

PenaltyAmountModal = Form.create()(PenaltyAmountModal);

export default PenaltyAmountModal;