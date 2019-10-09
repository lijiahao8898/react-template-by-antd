import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Upload, Button, Icon, message, Modal, Form, Select, Radio} from 'antd';
// tool
import {autobind} from 'core-decorators'
import Api from '@/api/index';
import Cookies from 'js-cookie';
// component
import ImportHistoryModal from './importHistoryModal';
import axios from 'axios'
import fileDownload from 'js-file-download'
const FormItem = Form.Item;
const Option = Select.Option;
const acceptType1 = '.xls,.xlsx';

// 导入
@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class ImportModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            uploading: false,
            canUpload: false,
            openImportHistoryModal: false,
            accept: acceptType1,
            fileList: []
        };
    }

    // 确定
    @autobind
    async modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                const {fileList} = this.state;
                const formData = new FormData();
                fileList.forEach(file => {
                    formData.append('file', file);
                });

                Object.keys(value).forEach(key => {
                    formData.append(key, value[key]);
                });

                formData.append('fileName', fileList[0].name);
                formData.append('fileType', fileList[0].type);
                // formData.append('uploadUser', Cookies.get('un'));
                // 服务端khId接收long类型，并且只能有一个id

                this.setState({uploading: true,});
                let data;
                if(value.type === 1) {
                    data = await Api('upload', 'uploadCases', formData);
                } else {
                    data = await Api('upload', 'uploadDebts', formData);
                }
                this.setState({uploading: false});
                if (data.success) {
                    this.setState({fileList: [],});
                    message.success('导入文件成功！');
                    this.props.onOk('true');
                    this.modalCancel();
                }
            }
        });
    }

    // 取消
    @autobind
    modalCancel () {
        this.props.onCancel();
        this.props.form.resetFields();
        this.setState({
            fileList: []
        });
    }

    openImportModal = () => {
        this.setState({
            openImportHistoryModal: true
        });
    };

    handleCancelImportHistoryModal = () => {
        this.setState({
            openImportHistoryModal: false
        });
    };

    // 导出
    @autobind
    async exportList (userType) {
        await Api('link', 'caseTemplateExport', {
            userType
        });
    }

    render () {
        const {uploading, fileList, accept, openImportHistoryModal} = this.state;
        const {openModal} = this.props;
        const {partner} = this.props.state.statusItemList;
        const {getFieldDecorator} = this.props.form;
        const props = {
            accept: accept,
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    this.setState({
                        canUpload: false
                    });
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                console.log(file);
                const size = file.size;
                const maxSize = 50 * 1024 * 1024;
                const name = file.name;
                if (size > maxSize) {
                    message.info('选择的文件大小超出50M上限，请重新选择合适的文件进行上传');
                    return false;
                }
                if (name.length > 50) {
                    message.info('选择的文件名称超出50个字符的上限，请修改名称后再上传');
                    return false;
                }
                this.setState(state => ({
                    fileList: [file],
                    canUpload: true
                }));
                return false;
            },
            fileList,
        };

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
            <React.Fragment>
                <Modal
                    title="案件导入"
                    maskClosable={false}
                    centered={true}
                    visible={openModal}
                    onOk={this.modalOk}
                    onCancel={this.modalCancel}
                    width="400px"
                    footer={[
                        <a key='link' onClick={this.openImportModal} className='m-r-md'>我的导入历史</a>,
                        <Button key="back" onClick={this.modalCancel}>取消</Button>,
                        <Button key="submit"
                                type="primary"
                                loading={uploading}
                                onClick={this.modalOk}
                                disabled={(fileList.length <= 0) || !this.state.canUpload}>{uploading ? '上传中' : '开始上传'}</Button>
                    ]}>
                    <Form>
                        <FormItem label='委催方' {...labelConfig}>
                            {getFieldDecorator('channelId', {
                                rules: [{
                                    required: true, message: '请选择委催方'
                                }],
                            })(
                                <Select
                                    showSearch
                                    style={{width: 200}}
                                    placeholder="请选择分类"
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
                        <FormItem label='导入类型' {...labelConfig}>
                            {getFieldDecorator('type', {
                                rules: [{
                                    required: true, message: '请选择导入类型'
                                }],
                            })(
                                <Radio.Group>
                                    <Radio value={1}>案件</Radio>
                                    <Radio value={2}>债权</Radio>
                                </Radio.Group>
                            )}
                        </FormItem>
                        <FormItem label='主体类型' {...labelConfig}>
                            {getFieldDecorator(('userType'), {
                                rules: [{
                                    required: true, message: '请选择主体类型'
                                }],
                            })(
                                <Radio.Group>
                                    <Radio value={'PERSONAL'}>自然人</Radio>
                                    <Radio value={'ENTERPRISE'}>企业</Radio>
                                </Radio.Group>
                            )}
                        </FormItem>
                        <FormItem label="选择文件" {...labelConfig}>
                            <Upload {...props}>
                                <Button style={{
                                    width: 200,
                                }}><Icon type="upload"/>选择文件</Button>
                            </Upload>
                        </FormItem>
                        <FormItem label="模板文件" {...labelConfig}>
                            <a className='m-r-md' onClick={() => this.exportList('PERSONAL')}>自然人模板下载</a>
                            <a onClick={() => this.exportList('ENTERPRISE')}>企业模板下载</a>
                        </FormItem>
                    </Form>
                </Modal>

                <ImportHistoryModal openImportHistoryModal={openImportHistoryModal} onCancel={this.handleCancelImportHistoryModal} />
            </React.Fragment>
        );
    }
}

ImportModal = Form.create()(ImportModal);

export default ImportModal;
