import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button, message, Form, Select, TimePicker, Input, Alert} from 'antd';
import Api from '@/api/index';
import baseConfig from '@/assets/js/config';
import Cookies from 'js-cookie';
import moment from 'moment';

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
                delete params.time;
                delete params.type;
                let data = null;
                this.setState({btnLoading: true});
                if(this.props.currentRecord.id) {
                    data = await Api('put', {
                        serviceUrl: `sms/tasks/${this.props.currentRecord.id}`
                    }, {
                        modifiedby: Cookies.get('un'),
                        ...params
                    });
                } else {
                    data = await Api('post', 'getSmsTasks', {
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

    render () {
        const {getFieldDecorator} = this.props.form;
        const {btnLoading, templateList} = this.state;
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
        let sendDateType, sendDate, time, partnerId;
        if (currentRecord.sendDate) {
            sendDateType = currentRecord.sendDate.indexOf('+') > -1 ? '1' : '2';
            sendDate = currentRecord.sendDate.replace('+', '').replace('-', '');
            time = moment((currentRecord.sendHour + ':' + currentRecord.sendMinute), 'HH:mm');
            partnerId = currentRecord.partnerId.split(',')
        } else {
            // const h = (new Date()).getHours();
            // const m = (new Date()).getMinutes();
            // time = moment(`${h}:${m}`, 'HH:mm')
        }
        return (
            <div>
                <Modal
                    title="自动发送"
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
                    <Form style={{position: 'relative'}}>
                        <FormItem label="任务名称" {...labelConfig}>
                            {getFieldDecorator('taskName', {
                                initialValue: currentRecord.taskName,
                                rules: [{required: true, message: '请输入任务名称'}],
                            })(
                                <Input type="text" placeholder="请输入任务名称" maxLength={30} style={{width: 200}} />
                                )}
                        </FormItem>
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
                        <FormItem style={{position: 'absolute', left: '150px', top: '58px'}}>
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
                        <FormItem label="模板名称" {...labelConfig}>
                            {getFieldDecorator('tmplId', {
                                initialValue: currentRecord.tmplId,
                                rules: [{required: true, message: '请选择模板名称'}],
                            })(
                                <Select
                                    showSearch
                                    style={{width: 295}}
                                    placeholder="请选择模板名称"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {templateList.map((item) => {
                                        return (
                                            <Option key={item.id} value={item.id}>{item.tmplName}</Option>
                                        );
                                    })}
                                </Select>
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
                    </Form>
                    <Alert type="error"
                           description={
                               <div style={{color: '#f5222d'}}>
                                   <div>仅签约代扣协议的客户可使用包含“银行卡号”、“银行名称”字段的短信模板，否则短信将发送失败</div>
                                   <div>新建/修改任务时请正确选择短信模板</div>
                               </div>
                           }>
                    </Alert>
                </Modal>
            </div>
        );
    }
}

AddModal = Form.create()(AddModal);

export default connect(mapStateToProps, mapDispatchToProps)(AddModal);