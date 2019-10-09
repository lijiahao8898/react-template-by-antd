import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button, message, Form, Select, TimePicker, Checkbox} from 'antd';
import Api from '@/api/index';
import baseConfig from '@/assets/js/config';
import Cookies from 'js-cookie';
import moment from 'moment';
import './addModal.scss'

const FormItem = Form.Item;
const Option = Select.Option;
const format = 'HH:mm';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

// 模板配置弹框
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

    UNSAFE_componentWillReceiveProps (nextProps) {
        if (!this.props.openModal && nextProps.openModal) {
            this.props.getPartner();
            this.getTemplateList();
        }
    }

    // 获取模板列表
    async getTemplateList () {
        const data = await Api('get', 'getSmsTemplates');
        if (data.success) {
            this.setState({templateList: data.datas.content,});
        }
    }

    // 确定
    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                let params = {...value};
                const sendHour = moment(value.time).format('HH');
                const sendMinute = moment(value.time).format('mm');
                params.sendHour = sendHour;
                params.sendMinute = sendMinute;
                params.sendDate = ((value.type === '1' ? '+' : '-' ) + value.sendDate);
                params.partnerId = value.partnerId.toString();
                params.detectSelfDefault = params.target.indexOf(1) > -1 ? 1 : 0;
                params.detectSelfOther = params.target.indexOf(2) > -1 ? 1 : 0;
                params.detectOtherContact = params.target.indexOf(3) > -1 ? 1 : 0;
                delete params.time;
                delete params.type;
                delete params.target;
                let data = null;
                this.setState({btnLoading: true});
                if(this.props.currentRecord.id) {
                    data = await Api('put', {
                        serviceUrl: `detect/tasks/${this.props.currentRecord.id}`
                    }, {
                        modifiedby: Cookies.get('un'),
                        ...params
                    });
                } else {
                    data = await Api('post', 'detectTasks', {
                        modifiedby: Cookies.get('un'),
                        ...params
                    });
                }
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

    disabledHours () {
        const hours = [];
        for (let i = 0; i < 8; i++) {
            hours.push(i);
        }
        for (let n = 24; n > 20; n--) {
            hours.push(n);
        }
        return hours;
    }

    onChange (checkedValue) {
        console.log(checkedValue);
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {btnLoading} = this.state;
        const {openModal, currentRecord} = this.props;
        const {partner} = this.props.statusItemList;
        const dateArr = new Array(17);
        for (let i = 0; i < 17; i++) {
            dateArr.fill(i, i, i + 1);
        }

        const labelConfig = {
            labelCol: {span: 5},
            wrapperCol: {span: 19},
            style: {
                width: '100%',
                marginRight: '0',
                display: 'inline-block'
            }
        };
        let sendDateType, sendDate, time, partnerId, target = [];
        if (currentRecord.sendDate) {
            sendDateType = currentRecord.sendDate.indexOf('+') > -1 ? '1' : '2';
            sendDate = currentRecord.sendDate.replace('+', '').replace('-', '');
            time = moment((currentRecord.sendHour + ':' + currentRecord.sendMinute), 'HH:mm');
            partnerId = currentRecord.partnerId.split(',');
            if(currentRecord.detectSelfDefault) {
                target.push(1)
            }
            if(currentRecord.detectSelfOther) {
                target.push(2)
            }
            if(currentRecord.detectOtherContact) {
                target.push(3)
            }
        } else {
            // const h = (new Date()).getHours();
            // const m = (new Date()).getMinutes();
            // time = moment(`${h}:${m}`, 'HH:mm')
        }
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
                    title="自动探测"
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
                    <Form style={{position: 'relative'}} id="autoDetectionModal">
                        <FormItem label="日期" {...labelConfig}>
                            T&nbsp;
                            {getFieldDecorator('type', {
                                initialValue: sendDateType ? sendDateType : '2',
                                rules: [{required: true, message: '请输入日期'}],
                            })(<Select
                                showSearch
                                style={{width: 50}}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                <Option value="1">+</Option>
                                <Option value="2">-</Option>
                            </Select>)}
                        </FormItem>
                        <FormItem style={{position: 'absolute', left: '158px', top: '0'}}>
                            {getFieldDecorator('sendDate', {
                                initialValue: sendDate,
                                rules: [{required: true, message: '请输入日期'}],
                            })(
                                <Select
                                    showSearch
                                    style={{width: 60}}
                                >
                                    {dateArr.map((item) => {
                                        return (
                                            <Option key={item} value={item}>{item}</Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="时间" {...labelConfig}>
                            {getFieldDecorator('time', {
                                initialValue: time,
                                rules: [{required: true, message: '请选择时间'}],
                            })(
                                <TimePicker
                                    style={{width: 124}}
                                    format={format} minuteStep={30}
                                    hideDisabledOptions
                                    disabledHours={this.disabledHours.bind(this)}
                                />
                            )}
                        </FormItem>
                        <FormItem label="渠道合作方" {...labelConfig}>
                            {getFieldDecorator('partnerId', {
                                initialValue: partnerId,
                                rules: [{required: true, message: '请选择渠道合作方'}],
                            })(
                                <Select
                                    showSearch
                                    mode="multiple"
                                    style={{width: 295}}
                                    placeholder="请选择渠道合作方"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {partner.map((item) => {
                                        return (
                                            <Option key={item.code} value={item.code}>{item.name}</Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="探测目标" {...labelConfig}>
                            {getFieldDecorator('target', {
                                initialValue: target.length > 0 ? target : [1],
                                rules: [{required: true, message: '请选择探测目标'}],
                            })(
                                <Checkbox.Group options={plainOptions} onChange={this.onChange.bind(this)} style={{width: '130px'}}/>
                            )}
                        </FormItem>
                    </Form>
                    <div style={{color: '#cf1322', marginLeft: '10px'}}>

                    </div>
                </Modal>
            </div>
        );
    }
}

AddModal = Form.create()(AddModal);

export default connect(mapStateToProps, mapDispatchToProps)(AddModal);
