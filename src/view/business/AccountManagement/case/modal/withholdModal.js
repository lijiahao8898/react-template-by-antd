import React, {Component} from 'react';
import {Modal, Button, message, Form, Input} from 'antd'
import Api from '@/api/index';
import {toThousands, accAdd, accAdds, subtr} from '@/assets/js/common';
import baseConfig from '@/assets/js/config';

const FormItem = Form.Item;
const {tip} = baseConfig;

// 发起代扣申请modal
class WithholdAmountModal extends Component {
    constructor (props) {
        super(props);
        this.state = {
            submitLoading: false
        };
    }

    // 确定
    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                const {amount, debtName, borrowerId} = this.getSelectedRowsTotal(this.props.selectedRows);
                this.setState({submitLoading: true});
                // 解决不传值或者传空服务端代扣报错的问题
                const money = amount ? amount : 0;
                const data = await Api('post', 'withholdElements', {
                    amount: money,
                    penaltyAmount: value.penaltyAmount ? value.penaltyAmount : 0,
                    debtName: debtName.toString(),
                    borrowerId: borrowerId.toString()
                });
                this.setState({submitLoading: false});
                if (data.success) {
                    message.success(tip.operateSuccess);
                    this.props.onOk('true');
                }
                this.modalCancel();
            }
        });
    }

    // 取消
    modalCancel () {
        this.props.form.resetFields();
        this.props.onCancel();
    }

    getSelectedRowsTotal (rows) {
        let obj = {
            penaltyAmount: 0,
            amount: 0,
            borrowerId: [],
            debtName: [],
            overdueDays: 0,
            repymtAmount: 0,
        };
        rows.forEach(item => {
            obj.penaltyAmount = accAdd(obj.penaltyAmount, item.penaltyAmount);
            obj.amount =  accAdds(obj.amount, item.investorInterest, item.investorPrincipal);   // 全部应还
            obj.repymtAmount = accAdds(obj.repymtAmount, item.repymtAmount);                    // 全部已还
            obj.borrowerId.push(item.borrowerId);
            obj.debtName.push(item.debtName);
            obj.overdueDays = accAdd(obj.overdueDays, item.overdueDays)
        });
        obj.amount = subtr(obj.amount, obj.repymtAmount);
        return obj
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {openModal, selectedRows} = this.props;
        const {submitLoading} = this.state;
        const {penaltyAmount, amount, overdueDays} = this.getSelectedRowsTotal(selectedRows);
        const FormItemLabel ={
            labelCol: {span: 12},
            wrapperCol: {span: 12},
        };
        return (
            <Modal
                title="发起代扣"
                maskClosable={false}
                visible={openModal}
                onOk={this.modalOk.bind(this)}
                onCancel={this.modalCancel.bind(this)}
                width={400}
                className="withholdModal"
                footer={[
                    <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                    <Button key="submit" type="primary" loading={submitLoading} onClick={this.modalOk.bind(this)}>确定</Button>
                ]}>
                <Form>
                    <FormItem {...FormItemLabel} label='代扣总额（本金+息费）'>
                            <span>{toThousands(amount)}</span>
                    </FormItem>
                    <FormItem {...FormItemLabel} label='逾期天数'>
                        <span>{overdueDays}</span>
                    </FormItem>
                    <FormItem {...FormItemLabel} label='罚息（24%年化）'>
                        {getFieldDecorator('penaltyAmount', {
                            initialValue: penaltyAmount ? penaltyAmount : null
                        })(
                            <Input type='text'/>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

WithholdAmountModal = Form.create()(WithholdAmountModal);

export default WithholdAmountModal;
