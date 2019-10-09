import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button, message, Icon} from 'antd';
import Api from '@/api/index';
import {
    toThousands,
    format,
    getSomethingTotal,
} from '@/assets/js/common';
import Search from '@/component/search/search';
import TablePage from '@/component/tablePage/tablePage';
import JycCard from '@/component/jycCard/jycCard';
import PageLoading from '@/component/pageLoading/pageLoading';
import ListItem from '@/component/listItem/listItem';
import PenaltyAmountModal from './penaltyAmountModal';
import ModalBatchSendMessage from './modalBatchSendMessage';
import WithholdModal from '@/component/withholdModal/withholdModal';
import baseConfig from '@/assets/js/config';
import qs from 'query-string';
import RepaymentVoucherModal from '../case/detail/repaymentVoucherModal';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class Channel extends Component {
    constructor (props) {
        super(props);
        this.state = {
            pageList: [],                       // 列表数据
            currentList: {},                    // 当前选中的一行
            messageTemplateList: [],
            searchParams: {},                   // 搜索的参数
            tableLoading: false,
            pageLoading: false,
            openModal: false,                   // 罚息modal
            openWithholdingModal: false,        // 代扣modal
            openBatchSendMessageModal: false,   // 批量发送短信modal
            pagination: {
                pageSize: baseConfig.initialPage.pageSize,
                pageNum: 1,
                total: 0
            },
            allPaymentAmountTotal: null,        // 当前搜索条件下的全部的应还总金额
            getAmountTotalLoading: false,
            allActualRepaymentAmountTotal: null,// 当前搜索条件下的全部的实际还款总金额
            getActualRepaymentAmountTotalLoading: false,
            isSearch: false,                    // 是否查询数据
            isReset: false,                     // 是否重置
            selectedRows: [],                   // 选择的列数组
            selectedRowKeys: [],                // 选择的列key数组，根据设置的rowKey
            withholdAmount: {},
            currentRepaymentRecord: [],
            openRepaymentVoucherModal: false,
            RepaymentSchedsFiles: [],
        };
    }

    componentDidMount () {
        this.props.getWithholdStatus();
        this.props.getRepaymentStatus();
        this.props.getRepaymentMethod();
        this.props.getPartner();
        this.props.getOverdueStatus();
        this.props.getCompensatoryStatus();
        this.props.getContactStatus();
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            let searchParams = {};
            Object.keys(search).forEach(key => {
                searchParams[key] = search[key]
            });
            this.setState({
                searchParams: Object.assign({}, searchParams)
            }, () => {
                this.getList();
            });
        }
    }

    resetItem () {
        this.setState({
            tableLoading: true,
            isSearch: true,
            selectedRowKeys: [],
            selectedRows: [],
        });
    }

    async getList () {
        const pager = {...this.state.pagination};
        this.resetItem();
        const params = Object.assign({}, this.state.pagination, this.state.searchParams);
        delete params.total;
        const data = await Api('get', 'getProductList', params);
        this.setState({tableLoading: false});
        if (data.success) {
            pager.total = data.datas.total;
            this.setState({
                pageList: data.datas.content,
                pagination: pager,
            });
        }
    }

    // 获取模板列表
    async getTemplateList () {
        const data = await Api('get', 'getSmsTemplates');
        if (data.success) {
            this.setState({messageTemplateList: data.datas.content,});
        }
    }

    // 搜索逾期产品列表应还总金额
    async getAllPaymentAmountTotal () {
        if (!this.state.isSearch) {
            message.info('请先点击搜索按钮');
            return;
        }
        const searchParams = {...this.state.searchParams};
        this.setState({
            getAmountTotalLoading: true
        });
        const data = await Api('get', 'productsSearchforamount', searchParams);
        if (data.success) {
            this.setState({
                allPaymentAmountTotal: data.datas.totalAmount,
            });
        }
        this.setState({
            getAmountTotalLoading: false
        });
    }

    // 搜索逾期产品列表实际还款总金额
    async getAllActualRepaymentAmountTotal () {
        if (!this.state.isSearch) {
            message.info('请先点击搜索按钮');
            return;
        }
        const searchParams = {...this.state.searchParams};
        this.setState({
            getActualRepaymentAmountTotalLoading: true
        });
        const data = await Api('get', 'productsSearchforrepymt', searchParams);
        if (data.success) {
            this.setState({
                allActualRepaymentAmountTotal: data.datas.totalAmount,
            });
        }
        this.setState({
            getActualRepaymentAmountTotalLoading: false
        });
    }

    // 改变展示的页数
    changeShowPageSize (current, pageSize) {
        const pager = {...this.state.pagination};
        pager.pageSize = pageSize;
        pager.pageNum = 1;
        this.resetItem();
        this.setState({
            pagination: pager,
        }, () => {
            this.getList();
        });
    }

    // 翻页
    changePageSize (page, pageSize) {
        const pager = {...this.state.pagination};
        pager.pageNum = page;
        this.resetItem();
        this.setState({
            pagination: pager,
        }, () => {
            this.getList();
        });
    }

    // 搜索
    handleSearch (newState) {
        const pager = {...this.state.pagination};
        pager.pageNum = 1;
        this.setState({
            searchParams: newState,
            pagination: pager,
            allPaymentAmountTotal: null,
            allActualRepaymentAmountTotal: null
        }, () => {
            this.getList();
        });
    }

    handleReset () {
        this.setState({
            isReset: true
        });
    }

    // 勾选验证
    selectedValidate (number = 1) {
        if (number < 100 && this.state.selectedRows.length > number) {
            message.info(baseConfig.tip.onlySelectOne);
            return false;
        } else if (this.state.selectedRows.length === 0) {
            message.info(baseConfig.tip.noSelect);
            return false;
        }
        return true;
    }

    // 打开罚息减免
    openPenaltyAmountModal () {
        if (this.selectedValidate()) {
            if (this.state.selectedRows[0].overdueStatus === '正常') {
                message.info('未逾期，不能修改罚息');
                return;
            }
            this.setState({
                openModal: true
            });
        }
    }

    // 更新
    update (value) {
        if (value === 'true') {
            this.getList();
        }
        this.cancel();
    }

    // 取消
    cancel () {
        this.setState({
            openModal: false,
            openWithholdingModal: false,
            openBatchSendMessageModal: false,
            selectedRowKeys: [],
            selectedRows: [],
            openRepaymentVoucherModal: false
        });
    }

    // 发起代扣
    async openWithholding () {
        if (this.selectedValidate()) {
            this.getWithholdAmount();
        }
    }

    async openBatchSendMessage () {
        if (this.selectedValidate(100)) {
            this.setState({
                openBatchSendMessageModal: true
            }, () => {
                this.getTemplateList();
            });
        }
    }

    async getWithholdAmount () {
        const data = await Api('get', 'getWithholdAmount', {
            repaymentId: this.state.selectedRows[0].repaymentId,
        });
        if (data.success) {
            this.setState({
                withholdAmount: data.datas.content,
                openWithholdingModal: true
            });
        }
    }

    // 导出
    async exportList () {
        if (!this.state.isSearch) {
            message.info(baseConfig.tip.exportWithNoSearch);
            return;
        }
        const params = Object.assign({}, this.state.params, this.state.searchParams);
        this.setState({pageLoading: true});
        delete params.total;
        await Api('link', 'productListExport', params);
        this.setState({pageLoading: false});
    }

    async showRepaymentVoucherModal (record) {
        await this.getRepaymentSchedsFiles(record);
        this.setState((prevState) => {
            return {
                currentRepaymentRecord: record,
                openRepaymentVoucherModal: true
            }
        })
    }

    // 获取具体的还款期次附加
    async getRepaymentSchedsFiles (record) {
        const data = await Api('get', {
            serviceUrl: `repymtscheds/${record.repaymentId}/voucher`
        }, {
            productId: record.repaymentId
        });
        if(data.success && data.datas) {
            this.setState({
                RepaymentSchedsFiles: data.datas.content
            })
        }
    }

    submit () {
        this.cancel()
    }

    render () {
        const {
            withholdStatus,
            repaymentStatus,
            repaymentMethod,
            partner,
            overdueStatus,
            compensatoryStatus,
            contactStatus
        } = this.props.statusItemList;
        const {
            appRepaymentSchedule,
            appOverdueAssetsDetail,
            appFinancingPersonTrackingDetail,
            overdueAssetsListExport,
            overdueAssetsPenaltyAmountReduce,
            overdueAssetsWithhold,
            overdueAssetsBatchSendMessageModal
        } = this.props.menuList.powerList;
        const {
            isReset,
            allPaymentAmountTotal,
            allActualRepaymentAmountTotal,
            getAmountTotalLoading,
            getActualRepaymentAmountTotalLoading,
            messageTemplateList,
            pageList,
            tableLoading,
            openModal,
            selectedRows,
            selectedRowKeys,
            currentList,
            openWithholdingModal,
            withholdAmount,
            pageLoading,
            openBatchSendMessageModal,
            currentRepaymentRecord,
            openRepaymentVoucherModal,
            RepaymentSchedsFiles
        } = this.state;
        const newBalanceTotal = getSomethingTotal('newBalance', pageList);
        const actualRepaymentAmountTotal = getSomethingTotal('actualRepaymentAmount', pageList);
        const searchItem = [{
            type: 'textSelect',
            label: '关键词',
            key: 'optionSelect',
            keyList: [{
                label: '姓名',
                key: 'borrowerName',
                maxLength: 30,
            }, {
                label: '证件号',
                key: 'borrowerIdNum',
                maxLength: 20,
            }, {
                label: '案件名称',
                key: 'productName',
                maxLength: 50,
            }],
        }, {
            type: 'select',
            label: '还款状态',
            key: 'repaymentStatusCode',
            multiple: true,
            option: repaymentStatus
        }, {
            type: 'select',
            label: '还款方式',
            key: 'repaymentMethodCode',
            option: repaymentMethod
        }, {
            type: 'daterange',
            label: '预计还款日',
            key: 'expectedRepayment',
            defaultValue: [new Date(), new Date()],
            disabledDate: true,
            keyList: ['expectedRepaymentStartDate', 'expectedRepaymentEndDate']
        }, {
            type: 'select',
            label: '逾期状态',
            key: 'overdueStatusCode',
            multiple: true,
            option: overdueStatus
        }, {
            type: 'select',
            label: '代扣状态',
            key: 'withholdStatusCode',
            option: withholdStatus
        }, {
            type: 'select',
            label: '委催方',
            key: 'partnerCode',
            option: partner,
            defaultValue: ['131740']
        }, {
            type: 'select',
            label: '代偿方式',
            key: 'compensatoryMethodCode',
            option: compensatoryStatus
        }, {
            type: 'select',
            label: '可联状态',
            key: 'contactStatusCode',
            option: contactStatus
        }, {
            type: 'textrange',
            label: '逾期天数',
            key: 'overdue',
            keyList: ['overdueMinDay', 'overdueMaxDay']
        }];
        const {history} = this.props;
        if (history.location.search && !isReset) {
            // 如果重置了，那么就不进行这个方法
            const search = qs.parse(history.location.search);
            searchItem.forEach(item => {
                item.defaultValue = [];
                if (item.keyList) {
                    item.keyList.forEach(i => {
                        if (i.key === 'borrowerIdNum') {
                            item.defaultValue = ['borrowerIdNum', search.borrowerIdNum];
                        }
                    });
                }
            });
        }
        const columns = [{
            title: '还款期次',
            dataIndex: 'repaymentPeriod',
            align: 'center',
            width: 60,
            render: (text, record, index) => {
                if (appRepaymentSchedule) {
                    return (
                        <div>
                            <Link to={{
                                pathname: `/app/overduePlan`,
                                search: `?productName=${record.productName}`
                            }} target="_blank">{text}</Link>
                            {record.hasRepymtAttach && <span className="link" onClick={this.showRepaymentVoucherModal.bind(this, record)}><Icon type="link" /></span>}
                        </div>

                    );
                } else {
                    return (<span>{text}</span>);
                }
            }
        }, {
            title: '案件名称',
            dataIndex: 'productName',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                if (appOverdueAssetsDetail) {
                    return (
                        <Link to={{
                            pathname: `/app/case/detail/${record.productId}`,
                            search: `?productName=${record.productName}`
                        }} target="_blank">{text}</Link>
                    );
                } else {
                    return (<span>{text}</span>);
                }
            }
        }, {
            title: '欠款人',
            dataIndex: 'borrowerName',
            align: 'center',
            width: 120,
            render: (text, record, index) => {
                if (appFinancingPersonTrackingDetail) {
                    return (
                        <Link to={{
                            pathname: `/app/account/detail/${record.borrowerId}`,
                            search: `?borrowerType=${record.borrowerType}`
                        }} target="_blank">{text}</Link>
                    );
                } else {
                    return (<span>{text}</span>);
                }
            }
        }, {
            title: '预计还款日',
            dataIndex: 'expectedRepaymentDate',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.expectedRepaymentDate && format(new Date(record.expectedRepaymentDate), 'yyyy-MM-dd')}</span>
                );
            }
        }, {
            title: '当前应还金额',
            dataIndex: 'newBalance',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.newBalance)}</span>
                );
            }
        }, {
            title: '实际还款金额',
            dataIndex: 'actualRepaymentAmount',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.actualRepaymentAmount)}</span>
                );
            }
        }, {
            title: '还款状态',
            dataIndex: 'repaymentStatus',
            align: 'center',
            width: 80
        }, {
            title: '逾期天数',
            dataIndex: 'overdueDay',
            align: 'center',
            width: 60,
        }, {
            title: '罚息',
            dataIndex: 'penaltyAmount',
            align: 'center',
            width: 60,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.penaltyAmount)}</span>
                );
            },
        }];
        const {pageNum, pageSize, total} = this.state.pagination;
        const white = '#fff';
        const rowSelection = {
            columnWidth: '40px',
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys,
                    selectedRows
                });
            }
        };
        return (
            <div>
                <div className="m-b-xs">
                    <Search search={searchItem} onChange={this.handleSearch.bind(this)} onReset={this.handleReset.bind(this)}/>
                </div>
                <div>
                    <JycCard>
                        <div className="m-b-sm">
                            {overdueAssetsListExport && <Button className="m-r-xs" type="primary" onClick={this.exportList.bind(this)}>导出</Button>}
                            {overdueAssetsPenaltyAmountReduce &&
                            <Button className="m-r-xs" type="primary" onClick={this.openPenaltyAmountModal.bind(this)}>罚息减免</Button>}
                            {overdueAssetsWithhold && <Button className="m-r-xs" type="primary" onClick={this.openWithholding.bind(this)}>发起代扣</Button>}
                            {overdueAssetsBatchSendMessageModal && <Button type="primary" onClick={this.openBatchSendMessage.bind(this)}>批量发送短信</Button>}
                        </div>
                        <TablePage
                            rowKey={'repaymentId'}
                            data={pageList}
                            columns={columns}
                            loading={tableLoading}
                            rowSelection={rowSelection}
                            footer={
                            <div>
                                <span className="m-r-md">本页当前应还：{toThousands(newBalanceTotal)}，</span>
                                <span className="m-r-md">实际还款：{toThousands(actualRepaymentAmountTotal)}；</span>
                                <span className="m-r-md">全部页当前应还：
                                    {getAmountTotalLoading ? <span>正在拼命查询中...</span> :
                                        (allPaymentAmountTotal || allPaymentAmountTotal === 0 ? <span>{toThousands(allPaymentAmountTotal)}</span> :
                                            <a onClick={this.getAllPaymentAmountTotal.bind(this)}>查询</a>)}，
                                    </span>
                                <span>实际还款：
                                    {getActualRepaymentAmountTotalLoading ? <span>正在拼命查询中...</span> :
                                        (allActualRepaymentAmountTotal || allActualRepaymentAmountTotal === 0 ?
                                            <span>{toThousands(allActualRepaymentAmountTotal)}</span> :
                                            <a onClick={this.getAllActualRepaymentAmountTotal.bind(this)}>查询</a>)}
                                    </span>
                            </div>
                        }
                            expandedRowRender={
                                record => {
                                    return (
                                        <div>
                                            <ListItem theme="themeTwo" background={white} itemLabel="放款金额" itemValue={toThousands(record.amountReceived)}/>
                                            <ListItem theme="themeTwo" background={white} itemLabel="放款日期"
                                                      itemValue={record.startDate && format(new Date(record.startDate), 'yyyy-MM-dd')}/>
                                            <ListItem theme="themeTwo" background={white} itemLabel="逾期状态" itemValue={record.overdueStatus}/>
                                            <ListItem theme="themeTwo" background={white} itemLabel="应还剩余本金"
                                                      itemValue={toThousands(record.investorPrincipal)}
                                            />
                                            <ListItem theme="themeTwo" background={white} itemLabel="应还剩余息费"
                                                      itemValue={toThousands(record.totalInterest)}
                                            />
                                            <ListItem theme="themeTwo" background={white} itemLabel="上次还款日"
                                                      itemValue={record.actualRepaymentDate && format(new Date(record.actualRepaymentDate), 'yyyy-MM-dd')}
                                            />
                                            <ListItem theme="themeTwo" background={white} itemLabel="委催方" itemValue={record.partnerName}/>
                                            <ListItem theme="themeTwo" background={white} itemLabel="还款方式" itemValue={record.repaymentMethod}/>
                                            {record.withholdStatus !== '失败' ?
                                                <ListItem theme="themeTwo"
                                                          background={white}
                                                          itemLabel="代扣状态"
                                                          itemValue={record.withholdStatus}/>
                                                :
                                                <ListItem theme="themeTwo"
                                                          background={white}
                                                          itemLabel="代扣状态"
                                                          itemValue={record.withholdStatus}
                                                          tipValue={record.withholdRemark}
                                                          fontColor={{color: '#cf1322'}}
                                                />
                                            }
                                            <ListItem theme="themeTwo" background={white} itemLabel="默认手机" itemValue={record.defaultContact}/>
                                            {
                                                record.contactStatus === '可联' ?
                                                    <ListItem
                                                        theme="themeTwo"
                                                        background={white}
                                                        itemLabel="可联状态"
                                                        itemValue={record.contactStatus}
                                                        tipValue={
                                                            <div>探测时间：{record.detectTime && format(new Date(record.detectTime), 'yyyy-MM-dd hh:mm:ss')}</div>
                                                        }>
                                                    </ListItem> :
                                                    <ListItem
                                                        theme="themeTwo"
                                                        background={white}
                                                        itemLabel="可联状态"
                                                        itemValue={record.contactStatus}
                                                        tipValue={
                                                            <div>
                                                                <div>探测时间：{record.detectTime && format(new Date(record.detectTime), 'yyyy-MM-dd hh:mm:ss')}</div>
                                                                <div>错误信息：{record.detectRemark}</div>
                                                            </div>
                                                        }
                                                        fontColor={{color: '#cf1322'}}>
                                                    </ListItem>
                                            }
                                        </div>
                                    );
                                }
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
                </div>
                <PenaltyAmountModal
                    openModal={openModal}
                    selectedRows={selectedRows}
                    currentList={currentList}
                    onOk={this.update.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
                <WithholdModal
                    openModal={openWithholdingModal}
                    selectedRows={selectedRows}
                    withholdAmount={withholdAmount}
                    onOk={this.update.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
                <ModalBatchSendMessage
                    openModal={openBatchSendMessageModal}
                    messageTemplateList={messageTemplateList}
                    selectedRows={selectedRows}
                    onOk={this.update.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
                <RepaymentVoucherModal
                    openModal={openRepaymentVoucherModal}
                    currentRepaymentRecord={currentRepaymentRecord}
                    RepaymentSchedsFiles={RepaymentSchedsFiles}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
                <PageLoading loading={pageLoading}>
                    <span>{baseConfig.tip.exporting}</span>
                </PageLoading>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Channel);
