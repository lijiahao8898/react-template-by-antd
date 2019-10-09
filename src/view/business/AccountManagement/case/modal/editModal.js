import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button, message, Modal, Form, Select, DatePicker, Input} from 'antd';
// tool
import Api from '@/api/index';
import Cookies from 'js-cookie';
import {autobind} from 'core-decorators';
import {regular, tip} from '@/assets/js/config'
import moment from 'moment';
// component
import EditHistoryModal from './editHistoryModal';

const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea} = Input;

@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class EditModal extends Component {
    constructor (props) {
        super(props);
        this.state = {
            openEditHistoryModal: false,
            submitLoading: false,
        };
    }

    // 确定
    @autobind
    async modalOk () {
        const {selectedRows} = this.props;
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                let params = {...value};
                if(params.expectedRepaymentDate) {
                    params.expectedRepaymentDate = moment(params.expectedRepaymentDate).format('YYYY-MM-DD')
                }
                if(params.realRepaymentDate) {
                    params.realRepaymentDate = moment(params.realRepaymentDate).format('YYYY-MM-DD')
                }
                this.setState({submitLoading: true});
                const data = await Api('PUT', 'updateCases', {
                    id: selectedRows[0].id,
                    ...params
                });
                this.setState({submitLoading: false});
                if (data.success) {
                    message.success(`编辑案件【${selectedRows[0].caseNum}】成功！`);
                    this.props.onOk('true');
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

    openImportModal = () => {
        this.setState({
            openEditHistoryModal: true
        });
    };

    handleCancelImportHistoryModal = () => {
        this.setState({
            openEditHistoryModal: false
        });
    };

    render () {
        const {openEditHistoryModal, submitLoading} = this.state;
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
            <React.Fragment>
                <Modal
                    title="案件编辑"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk}
                    onCancel={this.modalCancel}
                    width="450px"
                    footer={[
                        <a key='link' onClick={this.openImportModal} className='m-r-md'>查看编辑历史</a>,
                        <Button key="back" onClick={this.modalCancel}>取消</Button>,
                        <Button key="submit"
                                type="primary"
                                loading={submitLoading}
                                onClick={this.modalOk}>{'确定'}</Button>
                    ]}>
                    <div>
                        <Form>
                            <FormItem label='应还款日期' {...labelConfig}>
                                {getFieldDecorator('expectedRepaymentDate', {
                                    initialValue: selectedRows.length > 0 && selectedRows[0].expectedRepaymentDate ? moment(selectedRows[0].expectedRepaymentDate) : undefined,
                                    rules: [{
                                        required: true, message: '应还款日期不能为空'
                                    }],
                                })(
                                    <DatePicker style={{width: width}} format="YYYY-MM-DD"/>
                                )}
                            </FormItem>
                            <FormItem label='实还款日期' {...labelConfig}>
                                {getFieldDecorator('realRepaymentDate', {
                                    initialValue: selectedRows.length > 0 && selectedRows[0].realRepaymentDate ? moment(selectedRows[0].realRepaymentDate) : undefined
                                })(
                                    <DatePicker style={{width: width}} format="YYYY-MM-DD"/>
                                )}
                            </FormItem>
                            <FormItem label='应还本金' {...labelConfig}>
                                {getFieldDecorator('investorPrincipal', {
                                    initialValue: selectedRows.length > 0 && (selectedRows[0].investorPrincipal || selectedRows[0].investorPrincipal === 0) ? selectedRows[0].investorPrincipal : null,
                                    rules: [{
                                        pattern: regular.decimal, message: tip.formatError
                                    }],
                                })(
                                    <Input type='text' style={{width: width}} placeholdr='请输入应还本金'/>
                                )}
                            </FormItem>
                            <FormItem label='应还息费' {...labelConfig}>
                                {getFieldDecorator('investorInterest', {
                                    initialValue: selectedRows.length > 0 && (selectedRows[0].investorInterest || selectedRows[0].investorInterest === 0)  ? selectedRows[0].investorInterest : null,
                                    rules: [{
                                        pattern: regular.decimal, message: tip.formatError
                                    }],
                                })(
                                    <Input type='text' style={{width: width}} placeholdr='请输入应还息费'/>
                                )}
                            </FormItem>
                            <FormItem label='应还保证金' {...labelConfig}>
                                {getFieldDecorator('repymtBond', {
                                    initialValue: selectedRows.length > 0 && (selectedRows[0].repymtBond || selectedRows[0].repymtBond === 0)  ? selectedRows[0].repymtBond : null,
                                    rules: [{
                                        pattern: regular.decimal, message: tip.formatError
                                    }],
                                })(
                                    <Input type='text' style={{width: width}} placeholdr='请输入应还保证金'/>
                                )}
                            </FormItem>
                            <FormItem label='备注' {...labelConfig}>
                                {getFieldDecorator('remark', {
                                    initialValue: selectedRows.length > 0 && selectedRows[0].remark ? selectedRows[0].remark : null,
                                })(
                                    <TextArea style={{width: width}} autosize={{minRows: 6, maxRows: 6}}/>
                                )}
                            </FormItem>
                        </Form>
                    </div>
                </Modal>

                <EditHistoryModal openEditHistoryModal={openEditHistoryModal} onCancel={this.handleCancelImportHistoryModal}/>
            </React.Fragment>
        );
    }
}

export default Form.create()(EditModal);
