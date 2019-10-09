import React, {Component} from 'react';
import {Modal, Button, message, Form, Checkbox, Alert} from 'antd'
import Api from '@/api/index';
import {toThousands} from '@/assets/js/common';
import baseConfig from '@/assets/js/config';
import './withholdModal.scss';

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
                const {investorPrincipal, investorInterest, commission} = this.props.withholdAmount;
                const obj = {
                    repaymentId: this.props.selectedRows[0].repaymentId,
                    investorPrincipal: value.investorPrincipal ? investorPrincipal : null,
                    investorInterest: value.investorInterest ? investorInterest : null,
                    commission: value.commission ? commission : null
                };
                let n = 0;
                Object.keys(obj).forEach(key => {
                    if (!obj[key]) {
                        delete obj[key];
                    } else {
                        n += 1;
                    }
                });
                if (n <= 1) {
                    message.info(tip.noSelect);
                    return;
                }
                this.setState({submitLoading: true});
                const data = await Api('post', 'postWithhold', {
                    ...obj
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

    render () {
        const {getFieldDecorator} = this.props.form;
        const {investorPrincipal, investorInterest, commission} = this.props.withholdAmount;
        const {openModal} = this.props;
        const {submitLoading} = this.state;
        const FormItemLabel ={
            wrapperCol: {
                span: 24
            },
            style: {
                width: '150px',
            }
        };
        return (
            <Modal
                title="发起代扣"
                maskClosable={false}
                visible={openModal}
                onOk={this.modalOk.bind(this)}
                onCancel={this.modalCancel.bind(this)}
                width={250}
                className="withholdModal"
                footer={[
                    <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                    <Button key="submit" type="primary" loading={submitLoading} onClick={this.modalOk.bind(this)}>确定</Button>
                ]}>
                <Form layout="inline">
                    <FormItem {...FormItemLabel}>
                        {getFieldDecorator('investorPrincipal', {
                            valuePropName: 'checked',
                        })(
                            <Checkbox disabled={!investorPrincipal}>
                                <span>本金：</span>
                                <span>{toThousands(investorPrincipal)}</span>
                            </Checkbox>
                        )}
                    </FormItem>
                    <FormItem {...FormItemLabel}>
                        {getFieldDecorator('investorInterest', {
                            valuePropName: 'checked',
                        })(
                            <Checkbox disabled={!investorInterest}>
                                <span>利息：</span>
                                <span>{toThousands(investorInterest)}</span>
                            </Checkbox>
                        )}
                    </FormItem>
                    <FormItem {...FormItemLabel}>
                        {getFieldDecorator('commission', {
                            valuePropName: 'checked',
                        })(
                            <Checkbox disabled={!commission} style={{marginBottom: '15px'}}>
                                <span>居间费：</span>
                                <span>{toThousands(commission)}</span>
                            </Checkbox>
                        )}
                    </FormItem>
                </Form>
                <Alert
                    message="暂时在MG系统扣罚息。"
                    description=""
                    type="info"
                    showIcon
                />
            </Modal>
        );
    }
}

WithholdAmountModal = Form.create()(WithholdAmountModal);

export default WithholdAmountModal;
