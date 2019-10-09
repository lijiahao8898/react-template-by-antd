import React, {Component} from 'react';
import {Upload, Button, Icon, message, Modal, Form, Select} from 'antd';
import Api from '@/api/index';
import Cookies from 'js-cookie';

const FormItem = Form.Item;
const Option = Select.Option;
const acceptType1 = '.txt,.pdf,.doc,.docx,.xls,.xlsx,.bmp,.jpg,.jpeg,.png,.gif';

class UploadModal extends Component {
    constructor (props) {
        super(props);
        this.state = {
            uploading: false,
            canUpload: false,
            accept: acceptType1,
            fileList: []
        };
    }

    handleUpload = () => {
        const {fileList} = this.state;
        const formData = new FormData();
        fileList.forEach(file => {
            formData.append('files[]', file);
        });

        this.setState({
            uploading: true,
        });
    };

    // 确定
    async modalOk () {
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                const {fileList} = this.state;
                const selectedRows = [...this.props.selectedRows];
                let khIdArr = [];
                let repaymentIdsArr = [];
                let caseIdArr = [];
                const formData = new FormData();
                fileList.forEach(file => {
                    formData.append('file', file);
                });

                Object.keys(value).forEach(key => {
                    formData.append(key, value[key]);
                });

                selectedRows.forEach(item => {
                    khIdArr.push(item.borrowerId);
                    if (item.repaymentId) {
                        repaymentIdsArr.push(item.repaymentId);
                    }
                    if (item.id) {
                        caseIdArr.push(item.id);
                    }
                });

                formData.append('fileName', fileList[0].name);
                formData.append('fileType', fileList[0].type);
                formData.append('uploadUser', Cookies.get('un'));
                // 服务端khId接收long类型，并且只能有一个id
                formData.append('khId', khIdArr[0]);
                if (repaymentIdsArr.length > 0) {
                    formData.append('repaymentIds', repaymentIdsArr.toString());
                }
                if (caseIdArr.length > 0) {
                    formData.append('caseIds', caseIdArr.toString());
                }

                this.setState({
                    uploading: true,
                });
                const data = await Api('upload', {
                    serviceUrl: `upload/repymt`
                }, formData);
                this.setState({uploading: false});
                if (data.success) {
                    this.setState({
                        fileList: [],
                    });
                    message.success('上传文件成功！');
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
            fileList: []
        });
    }

    selectedItemValidate (value) {
        const productIdArr = [];
        const {
            fileList,
        } = this.state;
        const selectedRows = [...this.props.selectedRows];
        for (let i = 0; i < selectedRows.length; i++) {
            if (!productIdArr.includes(selectedRows[i].productId)) {
                productIdArr.push(selectedRows[i].productId);
            }
        }
        if (Number(value) === 1 && productIdArr.length >= 2) {
            message.info('不能同时为多个产品上传合同！');
            this.setState(() => {
                return {
                    canUpload: false
                };
            });
        } else {
            this.setState(() => {
                return {
                    canUpload: true
                };
            });
        }

        if (Number(value) === 1) {
            this.setState(() => {
                return {
                    accept: '.txt,.pdf,.doc,.docx,.xls,.xlsx,.bmp,.jpg,.jpeg,.png,.gif'
                };
            });
        } else {
            console.log(this.state.fileList);
            if (fileList.length > 0 && (fileList[0].type).indexOf('image') === -1) {
                // 凭证的时候选择的文件不是图片
                message.info('选择的文件不符合要求，只能选择.bmp,.jpg,.jpeg,.png,.gif结尾的图片。请重新选择！');
                this.setState(() => {
                    return {
                        fileList: []
                    };
                });
            }
            this.setState(() => {
                return {
                    accept: '.bmp,.jpg,.jpeg,.png,.gif'
                };
            });
        }
    }

    render () {
        const {uploading, fileList, accept} = this.state;
        const {openModal} = this.props;
        const {getFieldDecorator} = this.props.form;
        // console.log(this.props.selectedRows);
        const props = {
            accept: accept,
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                // console.log(file);
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
                }));
                return false;
            },
            fileList,
        };
        const partner = [{
            code: '1',
            name: '合同'
        }, {
            code: '2',
            name: '还款凭证'
        }];

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
            <Modal
                title="上传附件"
                maskClosable={false}
                centered={true}
                visible={openModal}
                onOk={this.modalOk.bind(this)}
                onCancel={this.modalCancel.bind(this)}
                width="300px"
                footer={[
                    <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
                    <Button key="submit"
                            type="primary"
                            loading={uploading}
                            onClick={this.modalOk.bind(this)}
                            disabled={(fileList.length <= 0) || !this.state.canUpload}>{uploading ? '上传中' : '开始上传'}</Button>
                ]}>
                <div>
                    <Form>
                        <FormItem label="分类" {...labelConfig}>
                            {getFieldDecorator('enclosureType', {
                                rules: [{
                                    required: true, message: '请选择分类'
                                }],
                            })(
                                <Select
                                    showSearch
                                    style={{width: 200}}
                                    placeholder="请选择分类"
                                    optionFilterProp="children"
                                    onChange={this.selectedItemValidate.bind(this)}
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
                        <FormItem label="文件" {...labelConfig}>
                            <Upload {...props}>
                                <Button style={{
                                    width: 200,
                                }}><Icon type="upload"/>选择文件</Button>
                            </Upload>
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
}

UploadModal = Form.create()(UploadModal);

export default UploadModal;
