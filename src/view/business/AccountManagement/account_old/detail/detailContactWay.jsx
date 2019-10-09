import React, {Component} from 'react'
import {Button, Radio, Tooltip} from 'antd';
import TablePage from '@/component/tablePage/tablePage';
import {format, getColumnStatus} from '@/assets/js/common';

class DetailContactWay extends Component {

    openAddContactsModal () {
        this.props.onOpenAddContactsModal()
    }

    changeSwitch (value, record) {
        this.props.changeSwitch(value, record)
    }

    render () {
        const {
            financingPersonTrackingDetailContactWayAdd,
            contactStatus
        } = this.props;
        const columns = [{
            title: '默认',
            dataIndex: 'isDefault',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <Radio name="setDefault" checked={record.isDefault === 1} onChange={(value) => {
                        this.changeSwitch(value, record);
                    }}/>
                );
            }
        }, {
            title: '手机',
            dataIndex: 'contactMobile',
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
            dataIndex: 'contactAddress',
            align: 'center',
            width: 180,
            render: (text, record, index) => {
                return (
                    <span>{`${record.contactProvince ? record.contactProvince : ''}
                            ${record.contactCity ? record.contactCity : ''}
                            ${record.contactArea ? record.contactArea : ''}
                            ${record.contactAddress ? record.contactAddress : ''}`
                    }</span>
                );
            }
        }, {
            title: '变更原因',
            dataIndex: 'reasonsChange',
            align: 'center',
            width: 100
        }, {
            title: '操作时间',
            dataIndex: 'operationTime',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                return (
                    <span>{record.operationTime && format(new Date(record.operationTime), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '操作员',
            dataIndex: 'operator',
            align: 'center',
            width: 80
        }];
        const {contactInformationList, tableLoading, page, changeShowPageSize, changePageSize} = this.props;
        console.log(page);
        return (
            <React.Fragment>
                <div className="m-b-xs">
                    {financingPersonTrackingDetailContactWayAdd && <Button className="m-r-xs" type="primary" onClick={this.openAddContactsModal.bind(this)}>添加</Button>}
                </div>
                <TablePage
                    rowKey="id"
                    data={contactInformationList}
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

export default DetailContactWay;