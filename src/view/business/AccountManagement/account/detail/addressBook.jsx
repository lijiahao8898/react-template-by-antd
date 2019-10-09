import React, {Component} from 'react';
import {Button, Radio, Tooltip, message} from 'antd';
import Api from '@/api/index';
import TablePage from '@/component/tablePage/tablePage';
import {format, getColumnStatus} from '@/assets/js/common';
import globalCfg from '@/assets/js/config';
import AddContactsModal from './addContactsModal';

class AddressBook extends Component {
    constructor (props) {
        super(props);
        this.configPageSize = globalCfg.initialPage.pageSize;
        this.tip = globalCfg.tip;

        this.state = {
            isAjax: false,
            tableLoading: false,
            openModal: false,
            contactInformationList: [],
            pagination: {
                pageSize: this.configPageSize,
                pageNum: 1,
                pageTotal: 0
            }
        };
    }

    componentDidMount () {
        this.getContactInformationList();
    }

    async getContactInformationList () {
        const pager = {...this.state.pagination};
        const {borrowId} = this.props;
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        this.setState({
            tableLoading: true
        });
        const data = await Api('get', 'getCustomerContactsList', {
            borrowerId: borrowId,
            ...params
        });
        if (data.success) {
            pager.pageTotal = data.datas.total;
            this.setState({
                contactInformationList: data.datas.content,
                pagination: pager,
            });
        }
        this.setState({
            tableLoading: false
        });
    }

    async changeSwitch (value, record) {
        const {borrowId} = this.props;
        if (this.isAjax) {
            message.info(this.tip.repeatClick);
            return;
        }
        this.setState({
            isAjax: true
        });
        const data = await Api('put', 'setCustomerContactDefault', {
            borrowerId: borrowId,
            id: record.id,
            type: record.type
        });
        if (data.success) {
            message.success('操作成功！');
            this.getContactInformationList();
        }
        this.setState({
            isAjax: false
        });
    }

    openAddContactsModal () {
        this.setState({
            openModal: true
        });
    }

    submit () {
        this.getContactInformationList();
        this.cancel();
    }

    cancel () {
        this.setState({
            openModal: false
        });
    }

    // 翻页
    changePageSize (page, pageSize) {
        const pager = {...this.state.pagination};
        pager.pageNum = page;
        this.setState({
            pagination: pager
        }, () => {
            this.getContactInformationList();
        });
    }

    // 改变展示的页数
    changeShowPageSize (current, pageSize) {
        const pager = {...this.state.pagination};
        pager.pageSize = pageSize;
        pager.pageNum = 1;
        this.setState({
            pagination: pager
        }, () => {
            this.getContactInformationList();
        });
    }

    render () {
        const {changeShowPageSize, changePageSize} = this.props;
        const {contactInformationList, pagination, tableLoading, openModal} = this.state;
        const {financingPersonTrackingDetailContactWayAdd} = this.props.powerList;
        const {contactStatus} = this.props.statusItemList;
        const columns = [{
            title: '类型',
            dataIndex: 'contactType',
            align: 'center',
            width: 100
        }, {
            title: '联系人手机',
            dataIndex: 'contactMobile',
            align: 'center',
            width: 100
        }, {
            title: '联系人名称',
            dataIndex: 'contactName',
            align: 'center',
            width: 100
        }, {
            title: '关系',
            dataIndex: 'relationship',
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
                        {record.detectResult ? <Tooltip placement="right" title={
                            <div>探测时间：{record.detectTime && format(new Date(record.detectTime), 'yyyy-MM-dd hh:mm:ss')}</div>
                        }>
                            <span>{record.detectResult}</span>
                        </Tooltip> : <Tooltip placement="right" title={
                            <div>
                                <div>探测时间：{record.detectTime && format(new Date(record.detectTime), 'yyyy-MM-dd hh:mm:ss')}</div>
                                <div>错误信息：{record.detectRemark}</div>
                            </div>
                        }>
                            <span>{record.detectResult}</span>
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
            title: '维护时间',
            dataIndex: 'operationTime',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                return (
                    <span>{record.operationTime}</span>
                );
            }
        }, {
            title: '操作员',
            dataIndex: 'operator',
            align: 'center',
            width: 80
        }, {
            title: '设为默认号码',
            dataIndex: 'isDefault',
            align: 'center',
            width: 120,
            render: (text, record, index) => {
                return (
                    <Radio name="setDefault" checked={record.isDefault === 1} onChange={(value) => {
                        this.changeSwitch(value, record);
                    }}/>
                );
            }
        }];
        return (
            <div>
                <div className="m-b-xs">
                    {financingPersonTrackingDetailContactWayAdd &&
                    <Button className="m-r-xs" type="primary" onClick={this.openAddContactsModal.bind(this)}>添加</Button>}
                </div>
                <TablePage
                    rowKey="id"
                    data={contactInformationList}
                    columns={columns}
                    loading={tableLoading}
                    /*pagination={{
                        current: pagination.pageNum,
                        pageSize: pagination.pageSize,
                        total: pagination.pageTotal,
                        onShowSizeChange: (current, pageSize) => {
                            return this.changeShowPageSize(current, pageSize);
                        },
                        onChange: (page, pageSize) => {
                            return this.changePageSize(page, pageSize);
                        }
                    }}*/
                />
                <AddContactsModal
                    openModal={openModal}
                    type={3}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
            </div>
        );
    }
}

export default AddressBook;
