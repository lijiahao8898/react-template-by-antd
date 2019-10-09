import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button, message, Form, Input, Select} from 'antd';
import Api from '@/api/index';
import baseConfig from '@/assets/js/config';
import Cookies from 'js-cookie';

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

// 催记记录modal
class TrackRecordModal extends Component {
    constructor (props) {
        super(props);
        const {tip} = baseConfig;
        this.state = {
            btnLoading: false
        };
        this.tip = tip;
        this.id = props.match.params.id;
    }

    // 确定
    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                this.setState({btnLoading: true});
                const id = value.productId ? value.productId : this.id;
                const data = await Api('post', {
                    serviceUrl: `products/${id}/tracks`
                }, {
                    id: id,
                    message: value.message,
                    createdby: Cookies.get('un'),
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
        this.props.form.resetFields()
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {btnLoading} = this.state;
        const {openModal,
            productInfo
        } = this.props;
        const productType = Object.prototype.toString.call(productInfo);
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
                    title="添加跟踪记录"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk.bind(this)}
                    onCancel={this.modalCancel.bind(this)}
                    width="750px"
                    footer={[
                        <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                        <Button key="submit" type="primary" loading={btnLoading} onClick={this.modalOk.bind(this)}>确定</Button>
                    ]}>
                    <Form>
                        {
                            productType === '[object Array]' ?
                                <FormItem
                                    label="产品名称"
                                    {...labelConfig}>
                                    {getFieldDecorator('productId', {
                                        rules: [{required: true, message: '请选择产品'}],
                                    })(
                                        <Select showSearch
                                                optionFilterProp="children"
                                                allowClear
                                                placeholder={`请选择产品`}>
                                            {productInfo.map((i) => {
                                                return (
                                                    <Option key={i.productId} value={i.productId}>{i.productName}</Option>
                                                );
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                                :
                                <FormItem label="产品名称" {...labelConfig}><p>{productInfo.proname}</p></FormItem>
                        }
                        <FormItem label="内容" {...labelConfig}>
                            {getFieldDecorator('message', {
                                rules: [{required: true, message: '请输入变更原因'}],
                            })(
                                <TextArea placeholder="请输入内容" maxLength={300} autosize={{ minRows: 6, maxRows: 6 }}/>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
    }
}

TrackRecordModal = Form.create()(TrackRecordModal);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TrackRecordModal));
