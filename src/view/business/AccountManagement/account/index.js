import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {
    Button,
    message,
    Tooltip
} from 'antd';
// tool
import {autobind} from 'core-decorators';
import {initialPage, tip} from '@/assets/js/config';
import {
    toThousands,
    format,
    selectedValidate,
    getSomethingTotal,
    getColumnStatus,
    getColumnStatusTotal,
    subtr
} from '@/assets/js/common';
import Api from '@/api/index';
// component
import Search from '@/component/search/search';
import TablePage from '@/component/tablePage/tablePage';
import PageLoading from '@/component/pageLoading/pageLoading';
import AutoDetectionModal from './autoDetectionModal';
import SeparateModal from './modal/separateModal';

// 债户列表
@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class Account extends Component {
    constructor (props) {
        super(props);
        this.state = {
            pageList: [],
            openModal: false,
            tableLoading: false,
            pageLoading: false,
            getAmountTotalLoading: false,
            openSeparateModal: false,           // 分单
            allAmountTotal: null,               // 当前搜索条件下的全部的应还总金额,
            searchParams: {},
            selectedRows: [],                   // 选择的列数组
            selectedRowKeys: [],                // 选择的列key数组，根据设置的rowKey
            pagination: {
                pageSize: initialPage.pageSize,
                pageNum: 1,
                total: 0
            },
            isSearch: false,                    // 是否搜索 (需要搜索才能导出)
            trackerList: []
        };
    }

    componentDidMount () {
        this.getTrackerList()
        this.getList();
    }

    // 获取催服专员
    async getTrackerList () {
        const data = await Api('get', 'trackerList');
        if (data.success) {
            const {content} = data.datas;
            let arr = [];
            content.forEach(item => {
                arr.push({
                    code: item.id,
                    name: item.trackerName
                });
            });
            this.setState({
                trackerList: arr,
            });
        }
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
        const data = await Api('get', 'getCustomerList', params);
        if (data.success) {
            pagination.total = data.datas.total;
            this.setState({
                pageList: data.datas.content,
                pagination: pagination
            });
        }
        this.setState({tableLoading: false});
    }

    // 页面统计查询（不需要传分页参数）
    @autobind
    async getAllAmountTotal () {
        if (!this.state.isSearch) {
            message.info(tip.needSearch);
            return;
        }
        const {searchParams} = this.state;

        this.setState({getAmountTotalLoading: true});
        const data = await Api('get', 'getCustomerAmountTotal', searchParams);
        if (data.success) {
            this.setState({
                allAmountTotal: data.datas.content,
            });
        }
        this.setState({getAmountTotalLoading: false});
    }

    // 搜索
    @autobind
    handleSearch (newState) {
        let pager = {...this.state.pagination};
        pager.pageNum = 1;

        this.setState({
            searchParams: newState,
            pagination: pager,
            allAmountTotal: null,            // 搜索重置统计结果,
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

    // 导出（废弃）
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

    // 设置页面数据的唯一标识
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

    // 弹框确定的回调
    @autobind
    submit () {
        this.setState({
            openModal: false,
            openSeparateModal: false,           // 分单
            selectedRowKeys: [],
            selectedRows: [],
        }, () => {
            this.getList();
        });
    }

    // 弹框取消的回调
    @autobind
    cancel () {
        this.setState({
            openModal: false,
            openSeparateModal: false,           // 分单
        });
    }

    // 自动探测
    @autobind
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

    // 分单
    @autobind
    openSeparateModal () {
        if (selectedValidate(100, this.state.selectedRows)) {
            this.setState({
                openSeparateModal: true
            });
        }
    }

    render () {
        const {
            tableLoading,
            pageLoading,
            allAmountTotal,
            getAmountTotalLoading,
            openModal,
            selectedRows,
            selectedRowKeys,
            pagination,
            pageList,
            openSeparateModal,
            trackerList
        } = this.state;
        const {
            overdueStatus,
            partner,
            contactStatus,
            caseTrackTypes
        } = this.props.state.statusItemList;

        const {
            // financingPersonTrackingListExport,           // 导出权限
            accountDetail,                                  // 债户详情权限
            financingPersonTrackingListBatchAutoDetection,  // 批量失联探测权限
            allCase,                                        // 跳转到案件权限
            accountSeparateModalCode                        // 分单权限
        } = this.props.state.menuList.powerList;

        const {list} = this.setColumnsKey();
        // 统计
        const amountReceivedTotal = getSomethingTotal('amount', pageList);
        const repymtAmountTotal = getSomethingTotal('repymtAmount', pageList);
        const money = subtr(amountReceivedTotal, repymtAmountTotal);
        // 勾选
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
        // 搜索条件
        const searchItem = [{
            type: 'textSelect',
            label: '债户',
            key: 'optionSelect',
            keyList: [{
                label: '名称',
                key: 'borrowerName',
                maxLength: 30,
            }, {
                label: '证件号',
                key: 'borrowerIdNo',
                maxLength: 20,
            }],
        }, {
            type: 'select',
            label: '逾期状态',
            key: 'overdueStatus',
            option: overdueStatus
        }, {
            type: 'select',
            label: '可联状态',
            key: 'contactStatus',
            option: contactStatus
        }, {
            type: 'select',
            label: '催服专员',
            key: 'trackId',
            option: trackerList,
        }, {
            type: 'select',
            label: '委催方',
            key: 'channelId',
            option: partner,
        },];

        const columns = [{
            title: '序号',
            align: 'center',
            width: 50,
            render: (text, record, index) => `${index + 1}`,
        }, {
            title: '债户名称',
            dataIndex: 'borrowerName',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                if (accountDetail) {
                    // 债户详情
                    return (
                        <Link to={{
                            pathname: `${this.props.match.path}/detail/${record.borrowerId}`,
                            search: `?borrowerType=${record.borrowerType}&bn=${record.borrowerName}`
                        }} target="_blank">{text}</Link>
                    );
                } else {
                    return (
                        <span>{text}</span>
                    );
                }
            }
        }, {
            title: '证件类型',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>身份证</span>
                );
            }
        }, {
            title: '证件号码',
            dataIndex: 'borrowerIdNo',
            align: 'center',
            width: 120
        }, {
            title: '案件数',
            dataIndex: 'caseCount',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                if (allCase) {
                    // 案件列表
                    return (
                        <Link to={{
                            pathname: `/app/case_new`,
                            search: `?borrowerIdNo=${record.borrowerIdNo}`
                        }} target="_blank">{text}</Link>
                    );
                } else {
                    return (
                        <span>{text}</span>
                    );
                }
            }
        }, {
            title: '应还金额',
            dataIndex: 'amount',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.amount)}</span>
                );
            }
        }, {
            title: '已还金额',
            dataIndex: 'repymtAmount',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.repymtAmount)}</span>
                );
            }
        }, {
            title: '逾期状态',
            dataIndex: 'overdueStatus',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatus(record.overdueStatus, overdueStatus, 'name', 'code')}</span>
                );
            }
        }, {
            title: '默认联系号码',
            dataIndex: 'mobile',
            align: 'center',
            width: 100
        }, {
            title: '是否可联',
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
                        <span
                            className={record.contactStatus === 1 ? '' : 'error'}>{getColumnStatus(record.contactStatus, contactStatus, 'name', 'code')}</span>
                    </Tooltip>
                );
            }
        }, {
            title: '委催方',
            dataIndex: 'channelIds',
            align: 'center',
            width: 200,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatusTotal(record.channelIds, partner, 'name', 'code')}</span>
                );
            }
        }];

        return (
            <div>
                <div className="m-b-xs">
                    <Search search={searchItem} onChange={this.handleSearch} background={'#e6f7ff'}/>
                </div>

                <div className="m-b-xs">
                    {accountSeparateModalCode && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.openSeparateModal}>分单</Button>}
                    {/*{financingPersonTrackingListExport && <Button className="m-r-xs" type="primary" onClick={this.exportList.bind(this)}>导出</Button>}*/}
                    {financingPersonTrackingListBatchAutoDetection &&
                    <Button className="m-r-xs" type="primary" onClick={this.openAutoDetectionModal}>批量失联探测</Button>}
                </div>

                <TablePage
                    rowKey="index"
                    data={list}
                    columns={columns}
                    loading={tableLoading}
                    rowSelection={rowSelection}
                    pageOtherHeight={229}
                    footer={
                        <div>
                            <span className="m-r-md">本页待还总额：{toThousands(money)}</span>
                            <span className="m-r-md">全部页待还总额：
                                {getAmountTotalLoading ? <span>正在拼命查询中...</span> :
                                    (allAmountTotal || allAmountTotal === 0 ? <span>{toThousands(allAmountTotal)}</span> :
                                        <a onClick={this.getAllAmountTotal}>查询</a>)}
                            </span>
                        </div>
                    }
                    pagination={{
                        current: pagination.pageNum,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        onShowSizeChange: (current, pageSize) => {
                            return this.changeShowPageSize(current, pageSize);
                        },
                        onChange: (page, pageSize) => {
                            return this.changePageSize(page, pageSize);
                        }
                    }}
                />

                <SeparateModal openModal={openSeparateModal}
                               onOk={this.submit}
                               onCancel={this.cancel}
                               selectedRows={selectedRows}
                               caseTrackTypes={caseTrackTypes}
                               trackerList={trackerList}
                />

                <AutoDetectionModal
                    openModal={openModal}
                    selectedRows={selectedRows}
                    onOk={this.submit}
                    onCancel={this.cancel}
                />
                <PageLoading loading={pageLoading}>
                    <span>{tip.exporting}</span>
                </PageLoading>
            </div>
        );
    }
}

export default withRouter(Account);
