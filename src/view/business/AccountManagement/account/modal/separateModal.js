import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button, message, Modal, Form, Select} from 'antd';
import {autobind} from 'core-decorators';
import PropTypes from 'prop-types';
import Api from '@/api/index';
// tool
import Cookies from 'js-cookie';
import {textMap, tip} from '@/assets/js/config';
import {accAdds, toThousands} from '@/assets/js/common';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class SeparateModal extends React.Component {
    static defaultProps = {
        openModal: false
    };
    static propTypes = {
        openModal: PropTypes.bool.isRequired,
        onOk: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired
    };

    constructor (props) {
        super(props);
        this.state = {
            operateLoading: false
        };
    }

    @autobind
    async modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                const borrowerIds = this.getCaseId(this.props.selectedRows);
                this.setState({
                    operateLoading: true
                })
                const data = await Api('POST', 'delegate', {
                    borrowerIds: borrowerIds,
                    createdby: Cookies.get('un'),
                    delegateType: value.delegateType,
                    trackerId: value.trackerId
                });
                if (data.success) {
                    message.success(tip.operateSuccess);
                    this.props.onOk();
                    this.props.form.resetFields();
                }
                this.setState({
                    operateLoading: false
                });
            }
        });
    }

    @autobind
    modalCancel () {
        this.props.onCancel();
        this.props.form.resetFields();
    }

    getCaseId (selectedRows) {
        let caseIdArr = [];

        selectedRows.forEach(item => {
            caseIdArr.push(item.borrowerId)
        });
        return caseIdArr.toString();
    }

    getTotalAmount (selectedRows) {
        let totalAmount = 0;
        selectedRows.forEach(item => {
            totalAmount = accAdds(totalAmount, item.amount, item.repymtAmount);
        });
        return toThousands(totalAmount);
    }

    render () {
        const {openModal, trackerList, selectedRows, caseTrackTypes} = this.props;
        const totalAmount = this.getTotalAmount(selectedRows);
        const {getFieldDecorator} = this.props.form;
        const {operateLoading} = this.state;
        const labelConfig = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
            style: {
                width: '100%',
                marginRight: '0',
                display: 'inline-block'
            }
        };

        const width = 200;

        return (
            <React.Fragment>
                <Modal
                    title="电催分单"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk}
                    onCancel={this.modalCancel}
                    width="350px"
                    footer={[
                        <Button key="back" onClick={this.modalCancel}>{textMap.cancel}</Button>,
                        <Button key="submit"
                                type="primary"
                                loading={operateLoading}
                                onClick={this.modalOk}
                                disabled={operateLoading}>{textMap.ok}</Button>
                    ]}>
                    <div>
                        <Form>
                            <FormItem label='分单总额' {...labelConfig}>
                                <span>{totalAmount}</span>
                            </FormItem>
                            <FormItem label='分单总件数' {...labelConfig}>
                                <span>{selectedRows.length}</span>
                            </FormItem>
                            <FormItem label='分单类型' {...labelConfig}>
                                {getFieldDecorator('delegateType', {
                                    rules: [{required: true, message: '请选择分单类型'}],
                                })(
                                    <Select
                                        showSearch
                                        allowClear
                                        style={{width: width}}
                                        placeholder="请选择分单类型"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {caseTrackTypes.map((item) => {
                                            return (
                                                <Option key={item.code} value={item.code}>{item.name}</Option>
                                            );
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem label='催收专员' {...labelConfig}>
                                {getFieldDecorator('trackerId', {
                                    rules: [{required: true, message: '请选择催收专员'}],
                                })(
                                    <Select
                                        showSearch
                                        allowClear
                                        style={{width: width}}
                                        placeholder="请选择催收专员"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {trackerList.map((item) => {
                                            return (
                                                <Option key={item.code} value={item.code}>{item.name}</Option>
                                            );
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem label='分单员' {...labelConfig}>
                                <span>{Cookies.get('un')}</span>
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
            </React.Fragment>
        );
    }
}

export default Form.create()(SeparateModal);
