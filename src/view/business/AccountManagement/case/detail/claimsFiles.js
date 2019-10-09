import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button} from 'antd';
import TablePage from '@/component/tablePage/tablePage';
// tool
import Api from '@/api/index';
import {format, getColumnStatus} from '@/assets/js/common';
import qs from 'query-string';
import {autobind} from 'core-decorators'
// 上传附件
import UploadModal from '../../overduePlan/uploadModal';

// 银行卡列表（个人和企业）
class BankList extends Component {
    constructor (props) {
        super(props);
        this.state = {
            openUploadModal: false,
            selectedRows: [], // 模拟勾选
            fileList: []
        };
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.caseId = search.caseId;
            this.debtId = search.debtId;
        }
        this.borrowerId = this.props.match.params.id;
        this.getList();
    }


    async getList () {
        const data = await Api('GET', 'getDebtEnclosures', {
            id: this.debtId
        });
        if(data.success) {
            this.setState({
                fileList: data.datas.content
            })
        }
    }

    @autobind
    openUploadModal () {
        this.setState({
            openUploadModal: true,
            selectedRows: [{
                borrowerId: this.borrowerId,
                id: this.caseId
            }]
        })
    }

    @autobind
    update () {
        this.getList();
        this.setState({
            openUploadModal: false,             // 上传附件modal
            selectedRows: [],
        });
    }

    @autobind
    cancel () {
        this.setState({
            openUploadModal: false,             // 上传附件modal
        });
    }

    render () {
        const {openUploadModal, selectedRows, fileList} = this.state;
        const fileMap = [{
            label: 'text',
            value: 'txt'
        }, {
            label: 'pdf',
            value: 'pdf'
        }, {
            label: 'word',
            value: 'doc'
        }, {
            label: 'word',
            value: 'docx'
        }, {
            label: 'excel',
            value: 'xls'
        }, {
            label: 'excel',
            value: 'xlsx'
        }, {
            label: 'image',
            value: 'bmp'
        }, {
            label: 'image',
            value: 'jpg'
        }, {
            label: 'image',
            value: 'jpeg'
        }, {
            label: 'image',
            value: 'png'
        }, {
            label: 'image',
            value: 'gif'
        }];

        const columns = [{
            title: '文件类型',
            dataIndex: 'fileType',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                const fileType = (record.enclosureName.split('.')[record.enclosureName.split('.').length - 1]);
                return (
                    <div className={`preview-icon icon icon-${getColumnStatus(fileType, fileMap)}`} />
                );
            }
        }, {
            title: '附件名称',
            dataIndex: 'enclosureName',
            align: 'center',
            width: 200
        }, {
            title: '上传时间',
            dataIndex: 'uploadTime',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.uploadTime && format(new Date(record.uploadTime), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '上传人',
            dataIndex: 'uploadUser',
            align: 'center',
            width: 100
        }, {
            title: '操作',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <a href={record.enclosureUrl} target='_blank'>下载</a>
                );
            }
        }];

        return (
            <div>
                <div className="m-b-xs">
                    <Button className="m-r-xs" type="primary" onClick={this.openUploadModal}>上传新文件</Button>
                </div>
                <TablePage rowKey="id" data={fileList} columns={columns} pageOtherHeight="190"/>
                <UploadModal openModal={openUploadModal} selectedRows={selectedRows} onOk={this.update} onCancel={this.cancel}/>
            </div>
        );
    }
}

export default withRouter(BankList);

