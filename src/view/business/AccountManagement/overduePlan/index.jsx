import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button, message, Tooltip, Icon} from 'antd';
import Api from '@/api/index';
import Search from '@/component/search/search';
import TablePage from '@/component/tablePage/tablePage';
import JycCard from '@/component/jycCard/jycCard';
import PageLoading from '@/component/pageLoading/pageLoading';
import ListItem from '@/component/listItem/listItem';
import qs from 'query-string';
import baseConfig from '@/assets/js/config';
import {
    toThousands,
    format,
    getSomethingTotal,
} from '@/assets/js/common';
import WithholdModal from '@/component/withholdModal/withholdModal';
import UploadModal from './uploadModal';
import RepaymentVoucherModal from '../case/detail/repaymentVoucherModal';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class overduePlan extends Component {
    constructor (props) {
        super(props);
        this.state = {
            list: [],                           // 列表数据
            searchParams: {},                   // 搜索的参数
            tableLoading: false,
            openWithholdingModal: false,        // 代扣modal
            pagination: {
                pageSize: baseConfig.initialPage.pageSize,
                pageNum: 1,
                total: 0
            },
            allPaymentAmountTotal: null,        // 当前搜索条件下的全部的应还总金额
            getAmountTotalLoading: false,
            allActualRepaymentAmountTotal: null,// 当前搜索条件下的全部的实际还款总金额
            getActualRepaymentAmountTotalLoading: false,
            selectedRows: [],                   // 选择的列数组
            selectedRowKeys: [],                // 选择的列key数组，根据设置的rowKey
            pageLoading: false,
            isSearch: false,                    // 是否搜索
            isReset: false,                     // 是否重置
            withholdAmount: {},
            openUploadModal: false,
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
        this.props.getContactStatus();
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.setState({
                searchParams: {
                    productName: search.productName
                }
            }, () => {
                this.getList();
            });
        }
    }

    async getList () {
        const pager = {...this.state.pagination};
        const searchParams = {...this.state.searchParams};
        this.setState({
            tableLoading: true,
            isSearch: true,
        });
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        Object.assign(params, searchParams);
        const data = await Api('get', 'getRepaymentScheduleList', params);
        this.setState({tableLoading: false});
        if (data.success) {
            pager.total = data.datas.total;
            this.setState({
                list: data.datas.content,
                pagination: pager,
            });
        }
    }

    async getAllPaymentAmountTotal () {
        if (!this.state.isSearch) {
            message.info('请先点击搜索按钮');
            return;
        }
        const searchParams = {...this.state.searchParams};
        this.setState({
            getAmountTotalLoading: true,
            selectedRowKeys: [],
            selectedRows: [],
        });
        const data = await Api('get', 'repymtschedsSearchforamount', searchParams);
        if (data.success) {
            this.setState({
                allPaymentAmountTotal: data.datas.totalAmount,
            });
        }
        this.setState({
            getAmountTotalLoading: false
        });
    }

    async getAllActualRepaymentAmountTotal () {
        if (!this.state.isSearch) {
            message.info('请先点击搜索按钮');
            return;
        }
        const searchParams = {...this.state.searchParams};
        this.setState({
            getActualRepaymentAmountTotalLoading: true,
            selectedRowKeys: [],
            selectedRows: [],
        });
        const data = await Api('get', 'repymtschedsSearchforrepymt', searchParams);
        if (data.success) {
            this.setState({
                allActualRepaymentAmountTotal: data.datas.totalAmount,
            });
        }
        this.setState({
            getActualRepaymentAmountTotalLoading: false
        });
    }

    handleSearch (newState) {
        let pager = {...this.state.pagination};
        pager.pageNum = 1;
        this.setState({
            searchParams: newState,
            pagination: pager,
            allPaymentAmountTotal: null,
            allActualRepaymentAmountTotal: null,
        }, () => {
            this.getList();
        });
    }

    // 翻页
    changePageSize (page, pageSize) {
        const pager = {...this.state.pagination};
        pager.pageNum = page;
        this.setState({
            pagination: pager
        }, () => {
            this.getList();
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
            this.getList();
        });
    }

    async exportList () {
        if (!this.state.isSearch) {
            message.info(baseConfig.tip.exportWithNoSearch);
            return;
        }
        const pager = {...this.state.pagination};
        const searchParams = {...this.state.searchParams};
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        Object.assign(params, searchParams);
        this.setState({
            pageLoading: true
        });
        await Api('link', 'repaymentScheduleListExport', params);
        this.setState({
            pageLoading: false
        });
    }

    handleReset () {
        this.setState({
            isReset: true
        });
    }

    // 发起代扣
    async openWithholding () {
        if (this.selectedValidateNumber()) {
            this.getWithholdAmount();
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

    // 勾选验证
    selectedValidateNumber (number = 1) {
        if (number < 100 && this.state.selectedRows.length > number) {
            message.info(baseConfig.tip.onlySelectOne);
            return false;
        } else if (this.state.selectedRows.length === 0) {
            message.info(baseConfig.tip.noSelect);
            return false;
        }
        return true;
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
            openWithholdingModal: false,
            openUploadModal: false,
            selectedRowKeys: [],
            selectedRows: [],
            openRepaymentVoucherModal: false
        });
    }

    selectedItemValidate () {
        const borrowerIdArr = [];
        const selectedRows = [...this.state.selectedRows];
        console.log(selectedRows);
        for (let i = 0; i < selectedRows.length; i++) {
            if (!borrowerIdArr.includes(selectedRows[i].borrowerId)) {
                // 不存在重复的
                borrowerIdArr.push(selectedRows[i].borrowerId);
            }
        }

        if (borrowerIdArr.length >= 2) {
            message.info('不能同时为多个融资人上传附件！');
            return false;
        }
        return true;
    }

    openUpload () {
        if (this.selectedValidateNumber(100)) {
            if (this.selectedItemValidate()) {
                this.setState({
                    openUploadModal: true,
                });
            }
        }
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
            contactStatus
        } = this.props.statusItemList;
        const {
            appFinancingPersonTrackingDetail,
            repaymentScheduleListExport,
            appOverdueAssetsDetail,
            repaymentScheduleWithhold,
            repaymentScheduleUploadFile
        } = this.props.menuList.powerList;
        const {
            isReset,
            list,
            tableLoading,
            pageLoading,
            allPaymentAmountTotal,
            allActualRepaymentAmountTotal,
            getAmountTotalLoading,
            getActualRepaymentAmountTotalLoading,
            openWithholdingModal,
            withholdAmount,
            selectedRows,
            selectedRowKeys,
            openUploadModal,
            currentRepaymentRecord,
            openRepaymentVoucherModal,
            RepaymentSchedsFiles
        } = this.state;
        const {history} = this.props;
        const newBalanceTotal = getSomethingTotal('newBalance', list);
        const actualRepaymentAmountTotal = getSomethingTotal('actualRepaymentAmount', list);
        const searchItem = [{
            type: 'text',
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
            label: '可联状态',
            key: 'contactStatusCode',
            option: contactStatus
        }];
        if (history.location.search && !isReset) {
            // 如果重置了，那么就不进行这个方法
            const search = qs.parse(history.location.search);
            searchItem.forEach(item => {
                // if (item.key === 'expectedRepayment') {
                //     item.defaultValue = [];
                // }
                item.defaultValue = [];
                if (item.keyList) {
                    item.keyList.forEach(i => {
                        if (i.key === 'productName') {
                            item.defaultValue = ['productName', search.productName];
                        }
                    });
                }
            });
        }
        const columns = [{
            title: '还款期次',
            dataIndex: 'repaymentPeriod',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                return (
                    <div>
                        <span className="m-r-xs" style={{width: '200px'}}>{text}</span>
                        {record.hasRepymtAttach && <span className="link" onClick={this.showRepaymentVoucherModal.bind(this, record)}><Icon type="link" /></span>}
                    </div>
                )
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
            width: 120,
            render: (text, record, index) => {
                return (
                    <span className="bold">{record.expectedRepaymentDate && format(new Date(record.expectedRepaymentDate), 'yyyy-MM-dd')}</span>
                );
            }
        }, {
            title: '当前应还金额',
            dataIndex: 'newBalance',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span className="bold">{toThousands(record.newBalance)}</span>
                );
            }
        }, {
            title: '罚息',
            dataIndex: 'penaltyAmount',
            align: 'center',
            width: 60,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.penaltyAmount)}</span>
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
            title: '逾期状态',
            dataIndex: 'overdueStatus',
            align: 'center',
            width: 60,
        }, {
            title: '代扣状态',
            dataIndex: 'withholdStatus',
            align: 'center',
            width: 60,
            render: (text, record, index) => {
                return (
                    record.withholdStatus === '失败' ? (<Tooltip placement="topLeft" title={record.withholdRemark}>
                        <span style={{color: '#cf1322'}}>{record.withholdStatus}</span>
                    </Tooltip>) : (<span>{record.withholdStatus}</span>)
                );
            }
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
                            {repaymentScheduleListExport && <Button className="m-r-xs" type="primary" onClick={this.exportList.bind(this)}>导出</Button>}
                            {repaymentScheduleWithhold && <Button className="m-r-xs" type="primary" onClick={this.openWithholding.bind(this)}>发起代扣</Button>}
                            {repaymentScheduleUploadFile && <Button type="primary" onClick={this.openUpload.bind(this)}>上传附件</Button>}
                        </div>
                        <TablePage
                            rowKey={'repaymentId'}
                            data={list}
                            columns={columns}
                            loading={tableLoading}
                            rowSelection={rowSelection}
                            expandedRowRender={
                                record => {
                                    return (
                                        <div>
                                            <ListItem theme="themeTwo" background={white} itemLabel="案件名称" itemValue={record.productName}>
                                                {appOverdueAssetsDetail ?
                                                    <Link target="_blank" to={`/app/case/detail/${record.productId}?productName=${record.productName}`}>{record.productName}</Link> :
                                                    <span>{record.productName}</span>}
                                            </ListItem>
                                            <ListItem theme="themeTwo" background={white} itemLabel="放款金额"
                                                      itemValue={toThousands(record.amountReceived)}
                                            />
                                            <ListItem theme="themeTwo" background={white} itemLabel="还款方式" itemValue={record.repaymentMethod}/>
                                            <ListItem theme="themeTwo" background={white} itemLabel="委催方" itemValue={record.partnerName}/>
                                            <ListItem theme="themeTwo" background={white} itemLabel="本金"
                                                      itemValue={toThousands(record.investorPrincipal)}
                                            />
                                            <ListItem theme="themeTwo" background={white} itemLabel="息费"
                                                      itemValue={toThousands(record.totalInterest)}
                                            />
                                            <ListItem theme="themeTwo" background={white} itemLabel="上次还款日"
                                                      itemValue={record.actualRepaymentDate && format(new Date(record.actualRepaymentDate), 'yyyy-MM-dd')}
                                            />
                                            <ListItem theme="themeTwo" background={white} itemLabel="付息起始日"
                                                      itemValue={record.startDate && format(new Date(record.startDate), 'yyyy-MM-dd')}/>
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

                <WithholdModal
                    openModal={openWithholdingModal}
                    selectedRows={selectedRows}
                    withholdAmount={withholdAmount}
                    onOk={this.update.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />

                <UploadModal
                    openModal={openUploadModal}
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

export default connect(mapStateToProps, mapDispatchToProps)(overduePlan);
