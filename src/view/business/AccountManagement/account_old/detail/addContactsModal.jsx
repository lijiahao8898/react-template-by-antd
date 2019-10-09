import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button, message, Form, Select, Input} from 'antd';
import Api from '@/api/index';
import Cookies from 'js-cookie';

const FormItem = Form.Item;
const Option = Select.Option;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

// 联系人，联系方式添加模板
class AddContactsModal extends Component {
    constructor (props) {
        super(props);
        this.state = {
            mobile: null,                   // 用于是否必填判断
            districtStatus: null,           // 用于是否必填判断
            addressStatus: null,            // 用于是否必填判断
            province: undefined,            // 城市区初始的展示
            city: undefined,
            district: undefined,

        };
        this.id = props.match.params.id;
    }

    componentDidMount () {
        this.props.getProvince();
    }

    // 确定
    modalOk () {
        this.props.form.validateFields(async (err, value) => {

            if (!err) {
                if(this.props.type === 2) {
                    // 添加联系方式
                    value.contactProvince && (value.contactProvince = value.contactProvince.label);
                    value.contactCity && (value.contactCity = value.contactCity.label);
                    value.contactArea && (value.contactArea = value.contactArea.label);
                    const data = await Api('post', {
                        serviceUrl: `borrowers/${this.id}/contactinfo`
                    }, {
                        operator: Cookies.get('un'),
                        ...value,
                    });
                    if (data.success) {
                        message.success('添加成功！');
                        this.props.onOk('true');
                    } else {
                        this.props.onOk('false');
                    }
                } else if (this.props.type === 3) {
                    // 添加联系人
                    value.contactPersonProvince && (value.contactPersonProvince = value.contactPersonProvince.label);
                    value.contactPersonCity && (value.contactPersonCity = value.contactPersonCity.label);
                    value.contactPersonArea && (value.contactPersonArea = value.contactPersonArea.label);
                    const data = await Api('post', {
                        serviceUrl: `borrowers/${this.id}/contactpersons`
                    }, {
                        operator: Cookies.get('un'),
                        ...value
                    });
                    if (data.success) {
                        message.success('添加成功！');
                        this.props.onOk('true');
                    } else {
                        this.props.onOk('false');
                    }
                }
                this.modalCancel()
            }
        });
    }

    // 取消
    modalCancel () {
        this.props.onCancel();
        this.props.form.resetFields()
        this.setState({
            mobile: null,                   // 用于是否必填判断
            districtStatus: null,           // 用于是否必填判断
            addressStatus: null,            // 用于是否必填判断
            province: undefined,
            city: undefined,
            district: undefined,
        })
    }

    handleProvinceChange (value) {
        this.props.form.setFieldsValue({
            contactCity: undefined,
            contactArea: undefined,
            contactPersonCity: undefined,
            contactPersonArea: undefined
        });
        if(!value) return;
        this.props.clearDistrict();
        this.props.getCity({
            pCode: value.key
        });
        this.setState({
            districtStatus: value
        }, () => {

        });
    }

    handleCityChange (value) {
        this.props.form.setFieldsValue({
            contactArea: undefined,
            contactPersonArea: undefined
        })
        if(!value) return;
        this.props.getDistrict({
            pCode: value.key
        });
    }

    changeUserMobile (e) {
        this.setState({
            mobile: e.target.value
        }, () => {

        });
    }

    changeAddress (e) {
        this.setState({
            addressStatus: e.target.value
        }, () => {

        });
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {province, city, district} = this.props.statusItemList;
        const {openModal, type} = this.props;
        const width = '249px';
        const labelConfig = {
            labelCol: {span: 5},
            wrapperCol: {span: 8},
            style: {
                width: '350px',
                marginRight: '0',
                display: 'inline-block'
            }
        };
        return (
            <div>
                <Modal
                    title="添加联系方式"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk.bind(this)}
                    onCancel={this.modalCancel.bind(this)}
                    width="750px"
                    footer={[
                        <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                        <Button key="submit" type="primary"
                                onClick={this.modalOk.bind(this)}>
                            确定
                        </Button>
                    ]}>
                    <Form layout="inline">
                        {type === 3 ? (<div><FormItem label="关系" {...labelConfig}>
                            {getFieldDecorator('relationship', {
                                rules: [
                                    {required: true , message: '请输入关系!'},
                                ],
                            })(
                                <Input type="text" placeholder="请输入关系" maxLength={64} style={{width: width}}/>
                            )}
                        </FormItem>
                        <FormItem label="姓名" {...labelConfig}>
                            {getFieldDecorator('contactPersonName', {
                                rules: [
                                    {required: true , message: '请输入姓名!'},
                                ],
                            })(
                                <Input type="text" placeholder="请输入姓名" maxLength={64} style={{width: width}}/>
                            )}
                        </FormItem></div>) : null}
                        <FormItem label="手机号" {...labelConfig}>
                            {getFieldDecorator(`${type === 2 ? 'contactMobile' : 'contactPersonMobile'}`, {
                                rules: [
                                    {required: true , message: '请输入手机号!'},
                                    {pattern: /^1[0-9]\d{9}$/, message: '输入的格式不正确'}
                                ],
                            })(
                                <Input type="text" placeholder="请输入手机号" style={{width: width}} onChange={this.changeUserMobile.bind(this)}/>
                            )}
                        </FormItem>
                        <FormItem label="省" {...labelConfig}>
                            {getFieldDecorator(`${type === 2 ? 'contactProvince' : 'contactPersonProvince'}`, this.state.province ? {
                                initialValue: this.state.province,
                            } : {})(
                                <Select
                                    showSearch
                                    labelInValue
                                    allowClear
                                    optionFilterProp="children"
                                    placeholder="请输入省"
                                    style={{width: width}}
                                    onChange={this.handleProvinceChange.bind(this)}>
                                    {province.map(item => {
                                        return (
                                            <Option key={item.code} title={item.name}>
                                                {item.name}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="市" {...labelConfig}>
                            {getFieldDecorator(`${type === 2 ? 'contactCity' : 'contactPersonCity'}`, this.state.city ? {
                                initialValue: this.state.city,
                            } : {})(
                                <Select
                                    showSearch
                                    labelInValue
                                    allowClear
                                    optionFilterProp="children"
                                    placeholder="请输入市"
                                    style={{width: width}}
                                    onChange={this.handleCityChange.bind(this)}>
                                    {city.map(item => {
                                        return (
                                            <Option key={item.code} title={item.name}>
                                                {item.name}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="区" {...labelConfig}>
                            {getFieldDecorator(`${type === 2 ? 'contactArea' : 'contactPersonArea'}`, this.state.district ? {
                                initialValue: this.state.district
                            } : {})(
                                <Select
                                    showSearch
                                    labelInValue
                                    allowClear
                                    optionFilterProp="children"
                                    placeholder="请输入区"
                                    style={{width: width}}>
                                    {district.map(item => {
                                        return (
                                            <Option key={item.code} title={item.name}>
                                                {item.name}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="详细地址" {...labelConfig}>
                            {getFieldDecorator(`${type === 2 ? 'contactAddress' : 'contactPersonAddress'}`)(
                                <Input type="text" placeholder="请输入详细地址，不含省市区" maxLength={256} style={{width: width}} onChange={this.changeAddress.bind(this)}/>
                            )}
                        </FormItem>
                        <FormItem label="变更原因" {...labelConfig}>
                            {getFieldDecorator('reasonsChange')(
                                <Input type="text" placeholder="请输入变更原因" maxLength={250} style={{width: width}}/>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
    }
}

AddContactsModal = Form.create()(AddContactsModal);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AddContactsModal));