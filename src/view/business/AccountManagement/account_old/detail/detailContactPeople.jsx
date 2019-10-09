import React, {Component} from 'react'
import {Button, Tooltip} from 'antd';
import TablePage from '@/component/tablePage/tablePage';
import {format, getColumnStatus} from '@/assets/js/common';

class DetailContactPeople extends Component {

    openAddContactsModal () {
        this.props.onOpenAddContactsModal()
    }

    render () {
        const {
            financingPersonTrackingDetailContactPeopleAdd,
            contactStatus
        } = this.props;

        const columns = [{
            title: '关系',
            dataIndex: 'relationship',
            align: 'center',
            width: 100
        }, {
            title: '姓名',
            dataIndex: 'contactPersonName',
            align: 'center',
            width: 100
        }, {
            title: '手机',
            dataIndex: 'contactPersonMobile',
            align: 'center',
            width: 100
        }, {
            title: '可联状态',
            dataIndex: 'detectResultCode',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <div>
                        {record.detectResultCode === 1 ? <Tooltip placement="right" title={
                            <div>探测时间：{record.detectTime && format(new Date(record.detectTime), 'yyyy-MM-dd hh:mm:ss')}</div>
                        }>
                            <span>{getColumnStatus(record.detectResultCode, contactStatus, 'name', 'code')}</span>
                        </Tooltip> : <Tooltip placement="right" title={
                            <div>
                                <div>探测时间：{record.detectTime && format(new Date(record.detectTime), 'yyyy-MM-dd hh:mm:ss')}</div>
                                <div>错误信息：{record.detectRemark}</div>
                            </div>
                        }>
                            <span className="error">{getColumnStatus(record.detectResultCode, contactStatus, 'name', 'code')}</span>
                        </Tooltip>}
                    </div>
                );
            }
        }, {
            title: '地址',
            dataIndex: 'contactPersonAddress',
            align: 'center',
            width: 180,
            render: (text, record, index) => {
                return (
                    <span>{`${record.contactPersonProvince ? record.contactPersonProvince : ''}
                            ${record.contactPersonCity ? record.contactPersonCity : ''}
                            ${record.contactPersonArea ? record.contactPersonArea : ''}
                            ${record.contactPersonAddress ? record.contactPersonAddress : ''}`
                    }</span>
                );
            }
        }, {
            title: '变更原因',
            dataIndex: 'reasonsChange',
            align: 'center',
            width: 100
        }, {
            title: '时间',
            dataIndex: 'createTime',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.createTime && format(new Date(record.createTime), 'yyyy-MM-dd')}</span>
                );
            }
        }, {
            title: '操作员',
            dataIndex: 'operator',
            align: 'center',
            width: 100
        }];
        const {contactPersonList, tableLoading, page, changeShowPageSize, changePageSize} = this.props;
        console.log(page);
        return (
            <React.Fragment>
                <div className="m-b-xs">
                    {financingPersonTrackingDetailContactPeopleAdd && <Button className="m-r-xs" type="primary" onClick={this.openAddContactsModal.bind(this)}>添加</Button>}
                </div>
                <TablePage
                    rowKey="id"
                    data={contactPersonList}
                    columns={columns}
                    loading={tableLoading}
                    pageOtherHeight="190"
                    pagination={{
                        current: page.pageNum,
                        pageSize: page.pageSize,
                        total: page.total,
                        onShowSizeChange: (current, pageSize) => {
                            return changeShowPageSize(current, pageSize);
                        },
                        onChange: (page, pageSize) => {
                            return changePageSize(page, pageSize);
                        }
                    }}
                />
            </React.Fragment>
        )
    }
}

export default DetailContactPeople;