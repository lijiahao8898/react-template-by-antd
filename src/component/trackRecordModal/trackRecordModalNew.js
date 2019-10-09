import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button, message, Form, Input, Select, DatePicker, Checkbox, Radio, Upload, Icon, Tag} from 'antd';
import Api from '@/api/index';
import Cookies from 'js-cookie';
import moment from 'moment';
import qs from 'query-string';
// tool
import {tip} from '@/assets/js/config';
import {overdueReasonOption, resultEffective, resultInvalid} from '@/assets/map/index';
// component
import PriviewImage from '../previewImage/index';
import {autobind} from 'core-decorators';

const FormItem = Form.Item;
const {TextArea} = Input;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const acceptType = '.txt,.pdf,.doc,.docx,.xls,.xlsx,.bmp,.jpg,.jpeg,.png,.gif';

// 催记记录
@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class TrackRecordModalNew extends Component {
    constructor (props) {
        super(props);
        this.state = {
            btnLoading: false,
            nextTime: false,
            aboutCaseList: []
        };
        // if (this.props.history.location.search) {
        //     const search = qs.parse(this.props.history.location.search);
        //     this.debtName = search.dn;
        //     this.id = search.id;
        //     this.borrowerName = search.bn;
        //     this.borrowerId = search.bid;
        //     this.caseNumber = search.cn;
        // }
    }

    componentDidMount () {
        this.props.action.getCaseTrackTypes();
    }

    handleOnChangeNextTime = (e) => {
        this.setState({
            nextTime: e.target.checked
        });
    };

    // 确定
    modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                const {modalFileList, locationSearchParams} = this.props;
                const formData = new FormData();
                let fileArr = [];
                modalFileList.forEach(item => {
                    // console.log(item);
                    // fileArr.push({
                    //     fileName: item.name,
                    //     file: item
                    // })
                    formData.append('files', item, item.name);
                });
                // const blob = new Blob(fileArr);
                if(value.nextTrackTime) {
                    value.nextTrackTime = moment(value.nextTrackTime).format('YYYY-MM-DD HH:mm:ss');
                }
                if(value.trackTime) {
                    value.trackTime = moment(value.trackTime).format('YYYY-MM-DD HH:mm:ss');
                }
                value.result = value.result.toString();
                if(value.overdueReason) {
                    value.overdueReason = value.overdueReason.toString();
                }

                // formData.append('enclosureDTOList', blob);
                Object.keys(locationSearchParams).forEach(key => {
                    if(locationSearchParams[key]) {
                        formData.append(key, locationSearchParams[key]);
                    }
                });
                //formData.append('caseId', locationSearchParams.id);
                //formData.append('debtName', locationSearchParams.debtName);
                formData.append('createdBy', Cookies.get('un'));
                //formData.append('borrowerId', locationSearchParams.borrowerId);

                Object.keys(value).forEach(key => {
                    if(value[key]) {
                        formData.append(key, value[key]);
                    }
                });

                this.setState({btnLoading: true});
                const data = await Api('upload', 'addCaseTrack', formData);
                this.setState({btnLoading: false});
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
        this.props.onCancel();
        this.props.form.resetFields();
        this.setState({
            btnLoading: false,
            nextTime: false
        });
    }

    @autobind
    async getBorrowersCase () {
        const {locationSearchParams} = this.props;
        const data = await Api('GET', 'getBorrowersCase', {
            id: locationSearchParams.borrowerId
        });
        if(data.success) {
            let arr = [];
            Object.keys(data.datas).forEach(key => {
                arr.push({
                    debtName: key,
                    debtCase: data.datas[key]
                })
            });
            this.setState({
                aboutCaseList: [...arr]
            })
        }
    }

    getCurrentTrackTypes (current, all) {
        let arr = [];
        for(let i = 0; i < all.length; i ++) {
            for(let n = 0; n < current.length; n ++) {
                if(all[i].code == current[n])  {
                    arr.push(all[i])
                }
            }
        }
        return arr;
    }

    render () {
        const {getFieldDecorator} = this.props.form;
        const {btnLoading, aboutCaseList} = this.state;
        const {openModal, operateType, modalFileList, modalPreviewList, record, currentCaseTrackTypes, locationSearchParams} = this.props;
        const {caseTrackTypes} = this.props.state.statusItemList;
        const trackTypes = this.getCurrentTrackTypes(currentCaseTrackTypes, caseTrackTypes);
        const labelConfig = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
            style: {
                width: '300px',
                marginRight: 0,
            }
        };
        const labelConfigNextTime = {
            labelCol: {span: 14},
            wrapperCol: {span: 10},
            style: {
                width: '120px',
                marginRight: 0,
            }
        };
        const labelConfigAllWidth = {
            labelCol: {span: 2},
            wrapperCol: {span: 22},
            style: {
                width: '800px',
                marginRight: 0,
            }
        };

        const props = {
            fileList: modalFileList,
            showUploadList: false,
            accept: acceptType,
            beforeUpload: (file, fileList) => {
                this.props.beforeUpload(file, fileList);
                return false;
            }
        };

        const Cancel = <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>;
        const Submit = <Button key="submit" type="primary" loading={btnLoading} onClick={this.modalOk.bind(this)}>确定</Button>;

        return (
            <div>
                <Modal
                    title={operateType === 1 ? '新建催记' : '查看催记'}
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk.bind(this)}
                    onCancel={this.modalCancel.bind(this)}
                    width="850px"
                    footer={operateType === 1 ? [Cancel, Submit] : [Cancel]}>
                    <Form layout="inline">

                        <FormItem label='时间' {...labelConfig}>
                            {getFieldDecorator('trackTime', {
                                initialValue: (operateType === 2 && record) ? moment(record.trackTime) : moment(new Date()),
                                rules: [{required: true, message: '请选择时间'}]
                            })(
                                <DatePicker
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{width: '100%'}}
                                    showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                />
                            )}
                        </FormItem>

                        <FormItem label='类型' {...labelConfig}>
                            {getFieldDecorator('type', {
                                initialValue: (operateType === 2 && record) ? (record.type).toString() : (trackTypes.length === 1 ? trackTypes[0].code : null),
                                rules: [{required: true, message: '请选择类型'}]
                            })(
                                <Select showSearch allowClear>
                                    {trackTypes.length > 0 && trackTypes.map((item, index) => {
                                        return (
                                            <Option key={index} value={item.code}>{item.name}</Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>

                        <FormItem label='债户' {...labelConfigNextTime}>
                            <span>{locationSearchParams.borrowerName}</span>
                        </FormItem>

                        {/*  <FormItem label='联系人' {...labelConfig}>
                            {getFieldDecorator('contactPersonId', {
                                rules: [{required: true, message: '请选择联系人'}]
                            })(
                                <Select showSearch allowClear>
                                    {people.map((item, index) => {
                                        return (
                                            <Option key={index} value={item.id}>{`${item.name}-${item.phone}`}</Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>

                        <FormItem label='联系号码' {...labelConfig}>
                            <span>/</span>
                        </FormItem>

                        <FormItem label='联系人关系' {...labelConfig}>
                            <span>/</span>
                        </FormItem>*/}

                        <FormItem label='关联案件' {...labelConfigAllWidth}>
                            {locationSearchParams.debtName && <span className='m-r-md'>{locationSearchParams.debtName}：
                                 <Tag color="#2db7f5" style={{marginRight: '2px'}}>{locationSearchParams.caseNumber}</Tag>
                            </span>}
                            <Button type='primary' size='small' ghost onClick={this.getBorrowersCase}>查看全部</Button>
                            <div style={{maxHeight: '200px', overflow: 'auto'}}>{aboutCaseList.length > 0 && aboutCaseList.map((item, index) => {
                                return (
                                    <p style={{marginBottom: 0}} key={index}>{item.debtName}：{item.debtCase.map(i => {
                                        return (
                                            <Tag key={i} color="#2db7f5" style={{marginRight: '2px'}}>{i}</Tag>
                                        )
                                    })}</p>
                                )
                            })}</div>
                        </FormItem>

                        <FormItem label='逾期原因' {...labelConfigAllWidth}>
                            {getFieldDecorator('overdueReason', {
                                initialValue: (operateType === 2 && record) ? (record.overdueReason && (record.overdueReason).split(',')) : null
                            })(
                                <CheckboxGroup options={overdueReasonOption}/>
                            )}
                        </FormItem>

                        <FormItem label='结果' {...labelConfigAllWidth}>
                            {getFieldDecorator('result', {
                                initialValue: (operateType === 2 && record) ? record.result : null,
                                rules: [{required: true, message: '请选择结果'}]
                            })(
                                <Radio.Group>
                                    <div>
                                        <span>有效：</span>
                                        {resultEffective.map((item, index) => {
                                            return (
                                                <Radio key={index} value={item.value}>{item.label}</Radio>
                                            );
                                        })}
                                    </div>
                                    <div>
                                        <span>无效：</span>
                                        {resultInvalid.map((item, index) => {
                                            return (
                                                <Radio key={index} value={item.value}>{item.label}</Radio>
                                            );
                                        })}
                                    </div>
                                </Radio.Group>
                            )}
                        </FormItem>

                        <FormItem label='上传附件' {...labelConfigAllWidth}>
                            <Upload {...props}>
                                <Button>
                                    <Icon type="upload"/>上传
                                </Button>
                            </Upload>
                            <div>
                                <PriviewImage files={modalPreviewList} delete={(i) => {
                                    this.props.deletePreviewImage(i);
                                }}/>
                            </div>
                        </FormItem>
                        <FormItem label='备注' {...labelConfigAllWidth}>
                            {getFieldDecorator('memo', {
                                initialValue: (operateType === 2 && record) ? record.memo : null,
                                rules: [{required: true, message: '请输入备注'}],
                            })(
                                <TextArea placeholder="请输入备注" autosize={{minRows: 4, maxRows: 4}}/>
                            )}
                        </FormItem>

                        <FormItem label='下次催收' {...labelConfigNextTime}>
                            <div>
                                {operateType === 2 && <Checkbox checked={!!record.nextTrackTime} onChange={this.handleOnChangeNextTime}>是</Checkbox>}
                                {operateType === 1 && <Checkbox onChange={this.handleOnChangeNextTime}>是</Checkbox>}
                            </div>
                        </FormItem>

                        <FormItem label='催收时间' {...labelConfig}>
                            {getFieldDecorator('nextTrackTime', {
                                initialValue: (operateType === 2 && record) ? (record.nextTrackTime && moment(record.nextTrackTime)) : null,
                                rules: this.state.nextTime ? [{required: true, message: '请输入催收时间'}] : [],
                            })(
                                <DatePicker
                                    format='YYYY-MM-DD HH:mm:ss'
                                    style={{width: '225px', marginRight: '75px'}}
                                    showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                    disabled={!this.state.nextTime}
                                />
                            )}
                        </FormItem>

                        <FormItem label='催收摘要' {...labelConfig}>
                            {getFieldDecorator('nextTrackSummary', {
                                initialValue: (operateType === 2 && record) ? record.nextTrackSummary : null,
                                rules: this.state.nextTime ? [{required: true, message: '请输入摘要'}] : [],
                            })(
                                <Input style={{width: '225px'}} disabled={!this.state.nextTime}/>
                            )}
                        </FormItem>

                        <FormItem label='催收员' {...labelConfigAllWidth}>
                            <span>{Cookies.get('un')}</span>
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
    }
}

TrackRecordModalNew = Form.create()(TrackRecordModalNew);

export default withRouter(TrackRecordModalNew);
