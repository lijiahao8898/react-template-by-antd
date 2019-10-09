import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {
    Button,
    message,
    Tooltip
} from 'antd';
import Api from '@/api/index';
import Search from '@/component/search/search';
import TablePage from '@/component/tablePage/tablePage';
import JycCard from '@/component/jycCard/jycCard';
import PageLoading from '@/component/pageLoading/pageLoading';
import {initialPage, tip} from '@/assets/js/config';
import {
    toThousands,
    format,
    selectedValidate,
    getSomethingTotal
} from '@/assets/js/common';
import AutoDecetionModal from './autoDetectionModal';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

// 融资人列表
class Account extends Component {
    constructor (props) {
        super(props);
        this.state = {
            pageList: [],
            openModal: false,
            tableLoading: false,
            pageLoading: false,
            getAmountTotalLoading: false,
            allAmountTotal: null,               // 当前搜索条件下的全部的应还总金额,
            getBalanceTotalLoading: false,
            allBalanceTotal: null,              // 当前搜索条件下的全部的余额
            searchParams: {},
            selectedRows: [],                   // 选择的列数组
            selectedRowKeys: [],                // 选择的列key数组，根据设置的rowKey
            pagination: {
                pageSize: initialPage.pageSize,
                pageNum: 1,
                total: 0
            },
            isSearch: false,                    // 是否搜索 (需要搜索才能导出)
        };
    }

    componentDidMount () {
        this.props.getOverdueStatus();
        this.props.getPartner();
        this.props.getContactStatus();
    }

    // 列表
    async getList () {
        const {pagination, searchParams} = this.state;
        const {pageSize, pageNum} = pagination;
        const params = {
            pageSize,
            pageNum
        };

        this.setState({
            tableLoading: true,
            isSearch: true,
            selectedRowKeys: [],
            selectedRows: [],
        });

        Object.assign(params, searchParams);
        const data = await Api('get', 'getBorrowerList', params);
        if (data.success) {
            pagination.total = data.datas.total;
            this.setState({
                pageList: data.datas.content,
                pagination: pagination
            });
        }
        this.setState({tableLoading: false});
    }

    async getAllAmountTotal () {
        // 页面统计查询（不需要传分页参数）
        if (!this.state.isSearch) {
            message.info(tip.needSearch);
            return;
        }
        const {searchParams} = this.state;

        this.setState({getAmountTotalLoading: true});
        const data = await Api('get', 'getBorrowerSearchforamount', searchParams);
        if (data.success) {
            this.setState({
                allAmountTotal: data.datas.totalAmount,
            });
        }
        this.setState({getAmountTotalLoading: false});
    }

    async getAllBalanceTotal () {
        // 页面统计查询（不需要传分页参数）
        if (!this.state.isSearch) {
            message.info(tip.needSearch);
            return;
        }
        const {searchParams} = this.state;

        this.setState({getBalanceTotalLoading: true});
        const data = await Api('get', 'getBorrowerSearchforbalance', searchParams);
        if (data.success) {
            this.setState({
                allBalanceTotal: data.datas.totalAmount,
            });
        }
        this.setState({getBalanceTotalLoading: false});
    }

    handleSearch (newState) {
        let pager = {...this.state.pagination};
        pager.pageNum = 1;

        this.setState({
            searchParams: newState,
            pagination: pager,
            allAmountTotal: null,            // 搜索重置统计结果,
            allBalanceTotal: null
        }, () => {
            this.getList();
        });
    }

    // 翻页
    changePageSize (page, pageSize) {
        let pager = {...this.state.pagination};
        pager.pageNum = page;

        this.setState({
            pagination: pager
        }, () => {
            this.getList();
        });
    }

    // 改变展示的页数
    changeShowPageSize (current, pageSize) {
        let pager = {...this.state.pagination};
        pager.pageSize = pageSize;
        pager.pageNum = 1;

        this.setState({
            pagination: pager
        }, () => {
            this.getList();
        });
    }

    async exportList () {
        if (!this.state.isSearch) {
            message.info(tip.exportWithNoSearch);
            return;
        }
        const params = Object.assign({}, this.state.searchParams);

        delete params.total;
        this.setState({pageLoading: true});
        await Api('link', 'borrowerListExport', params);
        this.setState({pageLoading: false});
    }

    setColumnsKey () {
        let list = [];
        let stateList = [...this.state.pageList];

        stateList.forEach((item, index) => {
            item.index = index;
            list.push(item);
        });

        return {
            list
        };
    }

    submit () {
        this.getList();
        this.cancel();
    }

    // 取消
    cancel () {
        this.setState({
            openModal: false,
            selectedRowKeys: [],
            selectedRows: [],
        });
    }

    openAutoDetectionModal () {
        if (selectedValidate(
            100,
            this.state.selectedRows,
            message
        )) {
            this.setState({
                openModal: true
            });
        }
    }

    render () {
        const {
            tableLoading,
            pageLoading,
            allAmountTotal,
            getAmountTotalLoading,
            allBalanceTotal,
            getBalanceTotalLoading,
            openModal,
            selectedRows,
            selectedRowKeys,
            pagination,
            pageList
        } = this.state;

        const {pageNum, pageSize, total} = pagination;

        const {
            overdueStatus,
            partner,
            contactStatus
        } = this.props.statusItemList;

        const {
            financingPersonTrackingListExport,
            appFinancingPersonTrackingDetail,
            financingPersonTrackingListBatchAutoDetection
        } = this.props.menuList.powerList;

        const {list} = this.setColumnsKey();
        const amountReceivedTotal = getSomethingTotal('amountReceived', pageList);
        const balanceTotal = getSomethingTotal('balance', pageList);

        const rowSelection = {
            columnWidth: '40px',
            selectedRowKeys: selectedRowKeys,
            onChange: (
                selectedRowKeys,
                selectedRows
            ) => {
                this.setState({
                    selectedRowKeys,
                    selectedRows
                });
            }
        };

        const searchItem = [{
            type: 'text',
            label: '姓名',
            key: 'borrowerName',
            maxLength: 30
        }, {
            type: 'select',
            label: '逾期状态',
            key: 'overdueStatusCode',
            multiple: true,
            option: overdueStatus
        }, {
            type: 'select',
            label: '可联状态',
            key: 'contactStatusCode',
            option: contactStatus
        }, {
            type: 'select',
            label: '委催方',
            key: 'partnerCode',
            option: partner,
            defaultValue: ['131740']
        }];

        const columns = [{
            title: '欠款方ID',
            dataIndex: 'borrowerId',
            align: 'center',
            width: 100
        }, {
            title: '欠款方姓名',
            dataIndex: 'borrowerName',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                if (appFinancingPersonTrackingDetail) {
                    return (
                        <Link to={{
                            pathname: `${this.props.match.path}/detail/${record.borrowerId}`,
                            search: `?borrowerType=${record.borrowerType}`
                        }} target="_blank">{text}</Link>
                    );
                } else {
                    return (
                        <span>{text}</span>
                    );
                }
            }
        }, {
            title: '放款总额（元）',
            dataIndex: 'amountReceived',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.amountReceived)}</span>
                );
            }
        }, {
            title: '逾期状态',
            dataIndex: 'overdueStatus',
            align: 'center',
            width: 100
        }, {
            title: '融资余额（元）',
            dataIndex: 'balance',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.balance)}</span>
                );
            }
        }, {
            title: '可联状态',
            dataIndex: 'contactStatus',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <Tooltip placement="right" title={
                        <div>
                            <div>探测时间：{record.detectTime && format(new Date(record.detectTime), 'yyyy-MM-dd hh:mm:ss')}</div>
                            {record.contactStatus === '可联' ? null : <div>错误信息：{record.detectRemark}</div>}
                        </div>
                    }>
                        <span className={record.contactStatus === '可联' ? '' : 'error'}>{text}</span>
                    </Tooltip>
                );
            }
        }, {
            title: '委催方',
            dataIndex: 'partnerName',
            align: 'center',
            width: 220
        }];

        return (
            <div>
                <div className="m-b-xs">
                    <Search search={searchItem} onChange={this.handleSearch.bind(this)}/>
                </div>
                <JycCard>
                    <div className="m-b-sm">
                        {financingPersonTrackingListExport && <Button className="m-r-xs" type="primary" onClick={this.exportList.bind(this)}>导出</Button>}
                        {financingPersonTrackingListBatchAutoDetection &&
                        <Button className="m-r-xs" type="primary" onClick={this.openAutoDetectionModal.bind(this)}>批量失联探测</Button>}
                    </div>
                    <TablePage
                        rowKey="index"
                        data={list}
                        columns={columns}
                        loading={tableLoading}
                        rowSelection={rowSelection}
                        footer={
                            <div>
                                <span className="m-r-md">本页融资总额：{toThousands(amountReceivedTotal)}，</span>
                                <span className="m-r-md">余额：{toThousands(balanceTotal)}；</span>
                                <span className="m-r-md">全部页融资总额：
                                    {getAmountTotalLoading ? <span>正在拼命查询中...</span> :
                                        (allAmountTotal || allAmountTotal === 0 ? <span>{toThousands(allAmountTotal)}</span> :
                                            <a onClick={this.getAllAmountTotal.bind(this)}>查询</a>)}，
                                </span>
                                <span>余额：
                                    {getBalanceTotalLoading ? <span>正在拼命查询中...</span> :
                                        (allBalanceTotal || allBalanceTotal === 0 ? <span>{toThousands(allBalanceTotal)}</span> :
                                            <a onClick={this.getAllBalanceTotal.bind(this)}>查询</a>)}
                                </span>
                            </div>
                        }
                        pagination={{
                            current: pageNum,
                            pageSize: pageSize,
                            total: total,
                            onShowSizeChange: (current, pageSize) => {
                                return this.changeShowPageSize(current, pageSize);
                            },
                            onChange: (page, pageSize) => {
                                return this.changePageSize(page, pageSize);
                            }
                        }}
                    />
                </JycCard>
                <AutoDecetionModal
                    openModal={openModal}
                    selectedRows={selectedRows}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
                <PageLoading loading={pageLoading}>
                    <span>{tip.exporting}</span>
                </PageLoading>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
