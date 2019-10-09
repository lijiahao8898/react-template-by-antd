import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button, message, Modal} from 'antd';
// tool
import {autobind} from 'core-decorators';
import Api from '@/api/index';
// import Cookies from 'js-cookie';
import {
    toThousands,
    format,
    getSomethingTotal,
    selectedValidate,
    getColumnStatus,
    accAdd,
    subtr
} from '@/assets/js/common';
import {initialPage, tip} from '@/assets/js/config';
import qs from 'query-string';
import {entrustStatus} from '@/assets/map';
// component
import Search from '@/component/search/search';
import TablePage from '@/component/tablePage/tablePage';
import JycCard from '@/component/jycCard/jycCard';
import PageLoading from '@/component/pageLoading/pageLoading';
import PenaltyAmountModal from './modal/penaltyAmountModal';                // 罚息减免
import WithholdModal from './modal/withholdModal';                          // 发起代扣
// import RepaymentVoucherModal from '../case/detail/repaymentVoucherModal';   // 还款凭证
import UploadModal from '../overduePlan/uploadModal';                       // 上传附件
import ModalBatchSendMessage from './modal/modalBatchSendMessage';          // 批量发送短信
import ImportModal from './modal/importModal';                              // 导入
import EditModal from './modal/editModal';                                  // 编辑
import SeparateModal from './modal/separateModal';                          // 分单
import AppointCaseModal from './modal/appointCaseModal';                    // 变更委案状态

const {confirm} = Modal;

@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class Channel extends Component {
    constructor (props) {
        super(props);
        this.state = {
            pageList: [],                       // 列表数据
            messageTemplateList: [],
            searchParams: {                     // 搜索的参数
                channelId: 131740
            },
            tableLoading: false,
            pageLoading: false,
            openModal: false,                   // 罚息减免modal
            openWithholdingModal: false,        // 发起代扣modal
            openBatchSendMessageModal: false,   // 批量发送短信modal
            openRepaymentVoucherModal: false,   // 还款凭证
            openUploadModal: false,             // 上传附件modal
            openImportModal: false,             // 导入modal
            openEditModal: false,               // 编辑
            openSeparateModal: false,           // 分单
            openAppointCaseModal: false,        // 变更委案状态
            pagination: {
                pageSize: initialPage.pageSize,
                pageNum: 1,
                total: 0
            },
            penaltyAmt: null,                   // 当前搜索条件下的全部的应还总金额
            getAmountTotalLoading: false,
            repymtAmt: null,                    // 当前搜索条件下的全部的实际还款总金额
            isSearch: false,                    // 是否查询数据
            isReset: false,                     // 是否重置
            selectedRows: [],                   // 选择的列数组
            selectedRowKeys: [],                // 选择的列key数组，根据设置的rowKey
            currentRepaymentRecord: [],
            RepaymentSchedsFiles: [],
            trackerList: [],                    // 催服专员
        };
    }

    componentDidMount () {
        if (this.props.history.location.search) {
            // 跳转带参数
            const search = qs.parse(this.props.history.location.search);
            let searchParams = {};
            Object.keys(search).forEach(key => {
                searchParams[key] = search[key];
            });
            this.setState({
                searchParams: Object.assign({}, searchParams)
            });
        }
        this.getTrackerList();
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
        const data = await Api('get', 'caseList', params);
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

    // 页面汇总金额
    @autobind
    async getAllPaymentAmountTotal () {
        if (!this.state.isSearch) {
            message.info('请先点击搜索按钮');
            return;
        }
        const searchParams = {...this.state.searchParams};
        this.setState({
            getAmountTotalLoading: true
        });
        const data = await Api('get', 'getCaseTotalAmount', searchParams);
        if (data.success) {
            this.setState({
                penaltyAmt: data.datas.content.penaltyAmt,
                repymtAmt: data.datas.content.repymtAmt
            });
        }
        this.setState({
            getAmountTotalLoading: false
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
            penaltyAmt: null,
            repymtAmt: null
        }, () => {
            this.getList();
        });
    }

    @autobind
    handleReset () {
        this.setState({
            isReset: true
        });
    }

    // 打开罚息减免
    @autobind
    openPenaltyAmountModal () {
        if (selectedValidate(1, this.state.selectedRows)) {
            if (this.state.selectedRows[0].overdueStatus === '正常') {
                message.info('未逾期，不能修改罚息');
                return;
            }
            this.setState({
                openModal: true
            });
        }
    }

    @autobind
    update () {
        this.getList();
        this.setState({
            openModal: false,                   // 罚息减免modal
            openWithholdingModal: false,        // 发起代扣modal
            openBatchSendMessageModal: false,   // 批量发送短信modal
            openRepaymentVoucherModal: false,   // 还款凭证
            openUploadModal: false,             // 上传附件modal
            openImportModal: false,             // 导入modal
            openEditModal: false,               // 编辑
            openSeparateModal: false,           // 分单
            openAppointCaseModal: false,        // 变更委案状态
            selectedRowKeys: [],
            selectedRows: [],
        });
    }

    @autobind
    cancel () {
        this.setState({
            openModal: false,                   // 罚息减免modal
            openWithholdingModal: false,        // 发起代扣modal
            openBatchSendMessageModal: false,   // 批量发送短信modal
            openRepaymentVoucherModal: false,   // 还款凭证
            openUploadModal: false,             // 上传附件modal
            openImportModal: false,             // 导入modal
            openEditModal: false,               // 编辑
            openSeparateModal: false,           // 分单
            openAppointCaseModal: false,        // 变更委案状态
        });
    }

    // 发起代扣
    @autobind
    openWithholding () {
        if (selectedValidate(1, this.state.selectedRows)) {
            this.setState({
                openWithholdingModal: true
            })
        }
    }

    @autobind
    openUploadModal () {
        if (selectedValidate(1, this.state.selectedRows)) {
            this.setState({
                openUploadModal: true
            });
        }
    }

    @autobind
    openAppointCaseModal () {
        if (selectedValidate(1, this.state.selectedRows)) {
            this.setState({
                openAppointCaseModal: true
            });
        }
    }

    @autobind
    openBatchSendMessage () {
        if (selectedValidate(100, this.state.selectedRows)) {
            this.setState({
                openBatchSendMessageModal: true
            }, () => {
                this.getTemplateList();
            });
        }
    }

    @autobind
    openEditModal () {
        if (selectedValidate(1, this.state.selectedRows)) {
            this.setState({
                openEditModal: true
            });
        }
    }

    openSeparateModal () {
        if (selectedValidate(100, this.state.selectedRows)) {
            this.setState({
                openSeparateModal: true
            });
        }
    }

    // 导出
    @autobind
    exportList () {
        if (!this.state.isSearch) {
            message.info(tip.exportWithNoSearch);
            return;
        }
        confirm({
            title: tip.prompt,
            content: '真的要导出所有搜出的记录吗？',
            onOk: async () => {
                const params = Object.assign({}, this.state.searchParams);
                this.setState({pageLoading: true});
                delete params.total;
                await Api('link', 'casesExport', params);
                this.setState({pageLoading: false});
            },
            onCancel () {

            },
        });
    }

    @autobind
    deleteItem () {
        const {selectedRows} = this.state;
        if (selectedValidate(1, selectedRows)) {
            const name = selectedRows.map(item => {
                return item.caseNum
            });
            const ids = selectedRows.map(item => {
                return item.id
            });
            confirm({
                title: tip.prompt,
                content: `确定删除选中的案件【${name}】吗？`,
                onOk: async () => {
                    this.setState({pageLoading: true});
                    const data = await Api('DELETE', 'updateCases', {
                        id: ids.toString()
                    });
                    this.setState({pageLoading: false});
                    if(data.success) {
                        message.success(`删除【${name}】成功！`);
                        this.getList();
                    }
                },
                onCancel () {

                },
            });
        }
    }

    @autobind
    async showRepaymentVoucherModal (record) {
        await this.getRepaymentSchedsFiles(record);
        this.setState((prevState) => {
            return {
                currentRepaymentRecord: record,
                openRepaymentVoucherModal: true
            };
        });
    }

    // 获取具体的还款期次附加
    async getRepaymentSchedsFiles (record) {
        const data = await Api('get', {
            serviceUrl: `repymtscheds/${record.repaymentId}/voucher`
        }, {
            productId: record.repaymentId
        });
        if (data.success && data.datas) {
            this.setState({
                RepaymentSchedsFiles: data.datas.content
            });
        }
    }

    goTrackList () {
        if (selectedValidate(1, this.state.selectedRows)) {
            const {selectedRows} = this.state;
            const win = window.open('about:blank');
            const href = `trackList?dn=${selectedRows[0].debtName}&id=${selectedRows[0].id}&bn=${selectedRows[0].borrowerName}&bid=${selectedRows[0].borrowerId}&cn=${selectedRows[0].caseNum}`;
            win.location.href = href;
        }
    }

    @autobind
    openModalHandle (name) {
        let obj = {};
        obj[name] = true;
        this.setState(Object.assign({}, obj))
    }

    render () {
        const {partner, overdueStatus, caseTrackTypes} = this.props.state.statusItemList;
        const {trackerList} = this.state;
        const {
            appRepaymentSchedule,
            // separateModalCode,
            trackListCode,
            importCaseCode,
            outputCaseCode,
            editCaseCode,
            deleteCasePower,
            sendMessageCasePower,
            uploadCasePower,
            appointCasePower,
            withholdingCasePower,
            caseDetail
        } = this.props.state.menuList.powerList;
        const {
            isReset,
            penaltyAmt,
            repymtAmt,
            getAmountTotalLoading,
            messageTemplateList,
            pageList,
            tableLoading,
            openModal,
            selectedRows,
            selectedRowKeys,
            openWithholdingModal,
            pageLoading,
            openBatchSendMessageModal,
            // currentRepaymentRecord,
            // openRepaymentVoucherModal,
            // RepaymentSchedsFiles,
            openUploadModal,
            openImportModal,
            openEditModal,
            openSeparateModal,
            openAppointCaseModal,
            pagination
        } = this.state;
        // 本金
        const investorPrincipalTotal = getSomethingTotal('investorPrincipal', pageList);
        // 息费
        const investorInterestTotal = getSomethingTotal('investorInterest', pageList);
        // 已还
        const repaymentAmount = getSomethingTotal('repymtAmount', pageList);
        const money = subtr(accAdd(investorPrincipalTotal, investorInterestTotal), repaymentAmount);
        const penaltyAmountTotal = getSomethingTotal('penaltyAmount', pageList);
        const searchItem = [{
            type: 'textSelect',
            label: '债户',
            key: 'optionSelect',
            keyList: [{
                label: '名称',
                key: 'borrowerName'
            }, {
                label: '证件号',
                key: 'borrowerIdNo'
            }],
        }, {
            type: 'text',
            label: '债权名称',
            key: 'debtName',
        }, {
            type: 'select',
            label: '逾期状态',
            key: 'overdueStatus',
            // multiple: true,
            option: overdueStatus
        }, {
            type: 'select',
            label: '委案状态',
            key: 'entrustStatus',
            option: entrustStatus
        }, {
            type: 'select',
            label: '委催方',
            key: 'channelId',
            option: partner,
            defaultValue: ['131740']
        }, {
            type: 'select',
            label: '催服专员',
            key: 'trackerId',
            option: trackerList,
        }, {
            type: 'select',
            label: '催服状态',
            key: 'trackStatus',
            multiple: true,
            add: true,
            option: caseTrackTypes
        }, {
            type: 'daterange',
            label: '预计还款日',
            key: 'expectedRepayment',
            keyList: ['repymtDateStart', 'repymtDateEnd']
        }];
        const {history} = this.props;
        if (history.location.search && !isReset) {
            // 如果重置了，那么就不进行这个方法
            const search = qs.parse(history.location.search);
            searchItem.forEach(item => {
                item.defaultValue = [];
                if (item.keyList) {
                    item.keyList.forEach(i => {
                        if (i.key === 'borrowerIdNo') {
                            item.defaultValue = ['borrowerIdNo', search.borrowerIdNo];
                        }
                    });
                }
            });
        }
        const columns = [{
            title: '序号',
            align: 'center',
            width: 50,
            render: (text, record, index) => `${index + 1}`,
        }, {
            title: '案号',
            dataIndex: 'caseNum',
            align: 'center',
            width: 60,
            render: (text, record, index) => {
                if (caseDetail) {
                    return (
                        <div>
                            <Link to={{
                                pathname: `/app/case_new/detail/${record.borrowerId}`,
                                search: `?borrowerType=${record.userType}&bn=${record.borrowerName}&caseId=${record.id}&debtId=${record.debtId}`
                            }} target="_blank">{text}</Link>
                        </div>
                    );
                } else {
                    return (<span>{text}</span>);
                }
            }
        }, {
            title: '委催方',
            dataIndex: 'channelId',
            align: 'center',
            width: 180,
            render: (text, record, index) => {
                if (partner) {
                    let name;
                    partner.forEach(item => {
                        if (Number(item.code) === record.channelId) {
                            name = item.name;
                        }
                    });
                    return (<span>{name}</span>);
                } else {
                    return (<span>-</span>);
                }
            }
        }, {
            title: '债权名称',
            dataIndex: 'debtName',
            align: 'center',
            width: 120,
        }, {
            title: '债户',
            dataIndex: 'borrowerName',
            align: 'center',
            width: 180,
            render: (text, record, index) => {
                return (
                    <div>
                        <p className='m-b-n'>{record.borrowerName}（<span style={{fontWeight: 'bold'}}>{record.mobile}</span>）</p>
                        <p className='m-b-n'>{record.borrowerIdNo}</p>
                    </div>
                );
            }
        }, {
            title: '委案日期',
            dataIndex: 'createdon',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.createdon && format(new Date(record.createdon), 'yyyy-MM-dd')}</span>
                );
            }
        }, {
            title: '应还日期',
            dataIndex: 'expectedRepaymentDate',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.expectedRepaymentDate && format(new Date(record.expectedRepaymentDate), 'yyyy-MM-dd')}</span>
                );
            }
        }, {
            title: '应还金额',
            dataIndex: 'investorPrincipal',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                const amount = accAdd(record.investorInterest, record.investorPrincipal);
                return (
                    <span>{toThousands(amount)}</span>
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
            title: '应付罚息',
            dataIndex: 'penaltyAmount',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(record.penaltyAmount)}</span>
                );
            }
        }, {
            title: '期次',
            dataIndex: 'repaymentPeriod',
            align: 'center',
            width: 60,
            render: (text, record, index) => {
                return (
                    <span>{record.repaymentPeriod} / {record.periods}</span>
                );
            }
        }, {
            title: '催服状态',
            dataIndex: 'trackStatusStr',
            align: 'center',
            width: 80
        }, {
            title: '委案状态',
            dataIndex: 'entrustStatus',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatus(record.entrustStatus, entrustStatus)}</span>
                );
            },
        }];
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
                    <Search search={searchItem} onChange={this.handleSearch.bind(this)} onReset={this.handleReset} background={'#e6f7ff'}/>
                </div>
                <div>
                    <JycCard>
                        <div className="m-b-sm">
                            {importCaseCode && <Button className="m-r-xs m-t-xs" type="primary" onClick={() => this.openModalHandle('openImportModal')}>导入</Button>}
                            {outputCaseCode && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.exportList}>导出</Button>}
                            {/*{<Button className="m-r-xs m-t-xs" type="primary" onClick={this.openPenaltyAmountModal}>罚息减免</Button>}*/}
                            {editCaseCode && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.openEditModal}>编辑</Button>}
                            {deleteCasePower && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.deleteItem}>删除</Button>}
                           {/* {separateModalCode && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.openSeparateModal.bind(this)}>分单</Button>}*/}
                            {trackListCode && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.goTrackList.bind(this)}>催记管理</Button>}
                            {sendMessageCasePower && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.openBatchSendMessage}>批量发送短信</Button>}
                            {uploadCasePower && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.openUploadModal}>上传附件</Button>}
                            {appointCasePower && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.openAppointCaseModal}>变更委案状态</Button>}
                            {withholdingCasePower && <Button className='m-t-xs' type="primary" onClick={this.openWithholding}>发起代扣</Button>}
                        </div>
                        <TablePage
                            rowKey={'id'}
                            data={pageList}
                            columns={columns}
                            loading={tableLoading}
                            rowSelection={rowSelection}
                            pageOtherHeight={248}
                            footer={
                                <div>
                                    <span className="m-r-md">本页待还总额：{toThousands(money)}，</span>
                                    <span className="m-r-md">应付罚息总额：{toThousands(penaltyAmountTotal)}；</span>
                                    <span className="m-r-md">全部页待还总额：
                                        {getAmountTotalLoading ? <span>正在拼命查询中...</span> :
                                            (repymtAmt || repymtAmt === 0 ? <span>{toThousands(repymtAmt)}</span> :
                                                <a onClick={this.getAllPaymentAmountTotal}>查询</a>)}，
                                    </span>
                                    <span>应付罚息总额：
                                        {getAmountTotalLoading ? <span>正在拼命查询中...</span> :
                                            (penaltyAmt || penaltyAmt === 0 ? <span>{toThousands(penaltyAmt)}</span> :
                                                <a onClick={this.getAllPaymentAmountTotal}>查询</a>)}
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
                    </JycCard>
                </div>
                <PenaltyAmountModal openModal={openModal} selectedRows={selectedRows} onOk={this.update} onCancel={this.cancel}/>
                <WithholdModal openModal={openWithholdingModal} selectedRows={selectedRows} onOk={this.update} onCancel={this.cancel}/>
                <ModalBatchSendMessage openModal={openBatchSendMessageModal} messageTemplateList={messageTemplateList} selectedRows={selectedRows} onOk={this.update} onCancel={this.cancel}/>
                {/*  <RepaymentVoucherModal openModal={openRepaymentVoucherModal}
                                       currentRepaymentRecord={currentRepaymentRecord}
                                       RepaymentSchedsFiles={RepaymentSchedsFiles}
                                       onOk={this.update.bind(this)}
                                       onCancel={this.cancel.bind(this)}
                />*/}
                <UploadModal openModal={openUploadModal} selectedRows={selectedRows} onOk={this.update} onCancel={this.cancel}/>
                <ImportModal openModal={openImportModal} selectedRows={selectedRows} onOk={this.update} onCancel={this.cancel}/>
                <EditModal openModal={openEditModal} selectedRows={selectedRows} onOk={this.update} onCancel={this.cancel}/>
                <SeparateModal openModal={openSeparateModal} onOk={this.update} onCancel={this.cancel} selectedRows={selectedRows} caseTrackTypes={caseTrackTypes} trackerList={trackerList}/>
                <AppointCaseModal openModal={openAppointCaseModal} selectedRows={selectedRows} onOk={this.update} onCancel={this.cancel}/>
                <PageLoading loading={pageLoading}>
                    <span>{tip.exporting}</span>
                </PageLoading>
            </div>
        );
    }
}

export default withRouter(Channel);
