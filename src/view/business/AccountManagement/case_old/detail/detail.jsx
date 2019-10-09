import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Tabs, Button, Tooltip, Icon, List, Skeleton} from 'antd';
import TrackRecordModal from '@/component/trackRecordModal/trackRecordModal';
import Api from '@/api/index';
import TablePage from '@/component/tablePage/tablePage';
import baseConfig from '@/assets/js/config';
import {toThousands, format, getColumnStatus} from '@/assets/js/common';
import JycCard from '@/component/jycCard/jycCard';
import DetailBaseInfo from './detailBaseInfo';
import RepaymentVoucherModal from './repaymentVoucherModal';
import { saveAs } from 'file-saver';
import qs from 'query-string';

const TabPane = Tabs.TabPane;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class OverdueAssetsDetail extends Component {
    constructor (props) {
        super(props);
        this.id = props.match.params.id;            // 匹配页面的id
        this.state = {
            productInfo: {},                        // 产品信息
            productFileList: [],                    // 附件列表
            productTracksList: [],                  // 跟踪记录
            repymtschedsSearchbyproductList: [],    // 还款计划
            RepaymentSchedsFiles: [],
            tableLoading: false,
            openModal: false,
            openRepaymentVoucherModal: false,
            currentRepaymentRecord: [],
            modalType: 1,
            pagination: {
                pageSize: baseConfig.initialPage.pageSize,
                pageNum: 1,
                total: 0
            }
        };
    }

    componentDidMount () {
        this.props.getOverdueStatus();
        this.props.getProductTypes();
        this.props.getPartner();
        this.getProductInfo();
        this.getProductFiles();
    }

    // 获取用户基本信息
    async getProductInfo () {
        const data = await Api('get', {
            serviceUrl: `products/${this.id}`
        }, {
            productId: this.id
        });
        if(data.success && data.datas) {
            this.setState({
                productInfo: data.datas.content
            })
        }
    }

    // 获取产品附件
    async getProductFiles () {
        const data = await Api('get', {
            serviceUrl: `products/${this.id}/contracts`
        }, {
            productId: this.id
        });
        if(data.success && data.datas) {
            this.setState({
                productFileList: data.datas.content
            })
        }
    }

    // 跟踪记录
    async getProductTracksList () {
        const pager = {...this.state.pagination};
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        this.setState({tableLoading: true});
        const data = await Api('get', {
            serviceUrl: `products/${this.id}/tracks`
        }, {
            productId: this.id,
            ...params
        });
        this.setState({tableLoading: false});
        if(data.success) {
            pager.total = data.datas.total;
            this.setState({
                productTracksList: data.datas.content,
                pagination: pager,
            })
        }
    }

    // 还款计划
    async getRepymtschedsSearchbyproduct () {
        const pager = {...this.state.pagination};
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        this.setState({tableLoading: true});
        const data = await Api('get', 'getRepymtschedsSearchbyproduct', {
            productId: this.id,
            ...params
        });
        this.setState({tableLoading: false});
        if(data.success) {
            pager.total = data.datas.total;
            this.setState({
                repymtschedsSearchbyproductList: data.datas.content,
                pagination: pager,
            })
        }
    }

    openAddContactsModal () {
        this.setState({
            openModal: true
        })
    }

    submit () {
        this.getPageInfoWithType();
        this.cancel()
    }

    cancel () {
        this.setState({
            openModal: false,
            openRepaymentVoucherModal: false
        })
    }

    // 翻页
    changePageSize (page, pageSize) {
        const pager = {...this.state.pagination};
        pager.pageNum = page;
        this.setState({
            pagination: pager
        }, () => {
            this.getPageInfoWithType()
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
            this.getPageInfoWithType();
        });
    }

    resetPagination () {
        const pager = {...this.state.pagination};
        pager.pageNum = 1;
        pager.pageSize = baseConfig.initialPage.pageSize;
        pager.total = 0;
        return pager;
    }

    // 改变tab
    changeTab (key) {
        const pager = this.resetPagination();
        this.setState({
            pagination: pager,
            modalType: Number(key),
        }, () => {
            this.getPageInfoWithType()
        });
    }

    getPageInfoWithType () {
        const key = this.state.modalType;
        if(key === 1) {
            this.getProductInfo();
            this.getProductFiles();
        } else if (key === 2) {
            // this.getRepymtschedsSearchbyproduct();
        } else if (key === 3) {
            this.getProductTracksList();
        }
    }

    setColumnsKey (targetList) {
        const list = [];
        targetList.forEach((item, index) => {
            item.index = index;
            list.push(item);
        });

        return {
            list
        };
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

    downloadFunc = (url, fileName) => {
        saveAs(url, fileName);
    };

    handleTabClick = (key) => {
        if(Number(key) === 2) {
            // 催还计划需要跳转
            if (this.props.history.location.search) {
                const search = qs.parse(this.props.history.location.search);
                const win = window.open('about:blank');
                win.location.href= `/app/overduePlan?productName=${search.productName}`
            }
        }
    };

    render () {
        const {
            productInfo,
            tableLoading,
            openModal,
            openRepaymentVoucherModal,
            currentRepaymentRecord,
            modalType,
            productFileList,
            RepaymentSchedsFiles
        } = this.state;
        const {pageNum, pageSize, total} = this.state.pagination;
        const {list} = this.setColumnsKey(this.state.productTracksList);
        const repymtschedsSearchbyproductList = this.setColumnsKey(this.state.repymtschedsSearchbyproductList);
        const {
            appFinancingPersonTrackingDetail,
            appOverdueAssetsDetailBasic,
            appOverdueAssetsDetailRepaymentPlanList,
            appOverdueAssetsDetailTrackList,
            appOverdueAssetsDetailTrackAdd
        } = this.props.menuList.powerList;
        const {productType} = this.props.statusItemList;
        const columnsProductTracksList = [{
            title: '类型',
            dataIndex: 'typeName',
            align: 'center',
            width: 100
        }, {
            title: '内容',
            dataIndex: 'message',
            align: 'center',
            width: 300,
            render: (text, record, index) => {
                return (
                    <span>{text ? text : '/'}</span>
                )
            }
        }, {
            title: '结果',
            dataIndex: 'result',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{text ? text : '/'}</span>
                )
            }
        }, {
            title: '时间',
            dataIndex: 'createdon',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.createdon && format(new Date(record.createdon), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '操作员',
            dataIndex: 'createdby',
            align: 'center',
            width: 100
        }];

        const columnsRepymtschedsSearchbyproductList = [{
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
            title: '融资人',
            dataIndex: 'borrowerName',
            align: 'center',
            width: 120,
            render: (text, record, index) => {
                if(appFinancingPersonTrackingDetail) {
                    return (
                        <Link to={{
                            pathname: `/app/account/detail/${record.borrowerId}`,
                            search: `?borrowerType=${record.borrowerType}`
                        }}  target="_blank">{text}</Link>
                    );
                } else {
                    return (<span>{text}</span>)
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
            title: '分配日',
            dataIndex: 'allocationDate',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.allocationDate && format(new Date(record.allocationDate), 'yyyy-MM-dd')}</span>
                );
            }
        }, {
            title: '实际还款日',
            dataIndex: 'actualRepaymentDate',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.actualRepaymentDate && format(new Date(record.actualRepaymentDate), 'yyyy-MM-dd')}</span>
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
            title: '罚息',
            dataIndex: 'penaltyAmount',
            align: 'center',
            width: 80,
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
            width: 100
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
        // .txt,.pdf,.doc,.docx,.xls,.xlsx,.bmp,.jpg,.jpeg,.png,.gif
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
        return (
            <div>
                <JycCard>
                    <Tabs type="card"
                          onChange={this.changeTab.bind(this)}
                          onTabClick={this.handleTabClick}
                    >
                        {appOverdueAssetsDetailBasic && <TabPane tab="基础信息" key="1">
                            <DetailBaseInfo productInfo={productInfo} productType={productType}/>
                            {productFileList.length > 0 && <List
                                header={<div>附件（{productFileList.length}个）</div>}
                                size="small"
                                style={{
                                    padding: '5px'
                                }}
                            >{productFileList.map((item, index) => {
                                const fileType = (item.enclosureName.split('.')[item.enclosureName.split('.').length - 1])
                                return (
                                    <List.Item actions={[<span className="download" style={{
                                        marginRight: '25px'
                                    }} onClick={this.downloadFunc.bind(this, item.enclosureUrl, item.enclosureName)}>下载</span>]} key={index}>
                                        <Skeleton avatar title={false} loading={false} active>
                                            <List.Item.Meta
                                                avatar={
                                                    <div style={{
                                                        background: '#fff',
                                                        color: 'rgba(0, 0, 0, 0.65)',
                                                        fontSize: '32px',
                                                        width: '50px',
                                                        height: '50px'
                                                    }}>
                                                        <div className={`preview-icon icon icon-${getColumnStatus(fileType, fileMap)}`} />
                                                    </div>
                                                }
                                                title={<span>{item.enclosureName}</span>}
                                                description={`由${item.uploadUser}上传于${format(new Date(item.uploadTime), 'yyyy-MM-dd hh:mm:ss')}`}
                                            />
                                        </Skeleton>
                                    </List.Item>
                                )
                            })}
                            </List>}
                        </TabPane>}
                        {appOverdueAssetsDetailRepaymentPlanList && <TabPane tab="催还计划" key="2">
                            {/*<TablePage*/}
                            {/*    rowKey="index"*/}
                            {/*    data={repymtschedsSearchbyproductList.list}*/}
                            {/*    columns={columnsRepymtschedsSearchbyproductList}*/}
                            {/*    loading={tableLoading}*/}
                            {/*/>*/}
                        </TabPane>}
                        {appOverdueAssetsDetailTrackList && <TabPane tab="催记列表" key="3">
                            <div className="m-b-xs">
                                {appOverdueAssetsDetailTrackAdd && <Button className="m-r-xs" type="primary" onClick={this.openAddContactsModal.bind(this)}>添加</Button>}
                            </div>
                            <TablePage
                                rowKey="index"
                                data={list}
                                columns={columnsProductTracksList}
                                loading={tableLoading}
                                pageOtherHeight="190"
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
                        </TabPane>}
                    </Tabs>
                </JycCard>
                <TrackRecordModal
                    openModal={openModal}
                    type={modalType}
                    productInfo={productInfo}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
                <RepaymentVoucherModal
                    openModal={openRepaymentVoucherModal}
                    currentRepaymentRecord={currentRepaymentRecord}
                    RepaymentSchedsFiles={RepaymentSchedsFiles}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />

            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OverdueAssetsDetail);
