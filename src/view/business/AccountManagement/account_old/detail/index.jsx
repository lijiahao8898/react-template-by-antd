import React, {Component, Suspense, lazy} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Card, Tabs, message} from 'antd';
import AddContactsModal from './addContactsModal';
import Api from '@/api/index';
import baseConfig from '@/assets/js/config';
import qs from 'query-string';
import TrackRecordModal from '@/component/trackRecordModal/trackRecordModal';

const DetailBaseInfo = lazy(() => import('./detailBaseInfo'));
const DetailAssetsList = lazy(() => import('./detailAssetsList'));
const DetailContactWay = lazy(() => import('./detailContactWay'));
const DetailContactPeople = lazy(() => import('./detailContactPeople'));
const DetailTrackList = lazy(() => import('./detailTrackList'));

const TabPane = Tabs.TabPane;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

// 融资人详情index
class FinacingPersionTrackingDetail extends Component {
    constructor (props) {
        super(props);
        this.id = props.match.params.id;
        this.configPageSize = baseConfig.initialPage.pageSize
        this.state = {
            contactInformationList: [],     // 联系方式列表
            contactPersonList: [],          // 联系人列表
            trackList: [],                  // 跟踪列表
            userInfo: {},                   // 基本信息
            tableLoading: false,
            openModal: false,
            openTrackRecordModal: false,
            tabType: 2,                     // 类型， 1： 基本信息 2：联系方式，3：联系人 4：资产列表
            pagination: {
                pageSize: this.configPageSize,
                pageNum: 1,
                total: 0
            },
            isAjax: false,
            currentPeopleProductList: []    // 当前融资人的产品列表
        };
        this.tip = baseConfig.tip;
        if(this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.borrowerType = search.borrowerType;
        }
    }

    componentDidMount () {
        this.props.getWithholdStatus();
        this.props.getBankList();
        this.props.getRepaymentStatus();
        this.props.getRepaymentMethod();
        this.props.getProductTypes();
        this.props.getContactStatus();
        this.getPersonalInfo();
    }

    // 获取用户基本信息
    async getPersonalInfo () {
        const data = await Api('get', this.borrowerType === '1' ? 'getBorrowerPersonalDetail' : 'getBorrowerEnterpriseDetail', {
            borrowerId: this.id
        }, true, 'borrowerId');
        if(data.success && data.datas) {
            this.setState({
                userInfo: data.datas.content
            })
        }
    }

    async getContactInformationList () {
        const pager = {...this.state.pagination};
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        const data = await Api('get', {
            serviceUrl: `borrowers/${this.id}/contactinfo`
        }, {
            borrowerId: this.id,
            ...params
        });
        if(data.success) {
            pager.total = data.datas.total;
            this.setState({
                contactInformationList: data.datas.content,
                pagination: pager,
            })
        }
    }

    async getContactPersonList () {
        const pager = {...this.state.pagination};
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        const data = await Api('get', {
            serviceUrl: `borrowers/${this.id}/contactpersons`
        }, {
            borrowerId: this.id,
            ...params
        });
        if(data.success) {
            pager.total = data.datas.total;
            this.setState({
                contactPersonList: data.datas.content,
                pagination: pager,
            })
        }
    }

    async getTrackList () {
        const pager = {...this.state.pagination};
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        const data = await Api('get', {
            serviceUrl: `borrowers/${this.id}/tracks`
        }, {
            borrowerId: this.id,
            ...params
        });
        if(data.success) {
            pager.total = data.datas.total;
            this.setState({
                trackList: data.datas.content,
                pagination: pager,
            })
        }
    }


    openAddContactsModal () {
        this.setState({
            openModal: true
        })
    }

    openTrackRecordModalFunc () {
        this.setState({
            openTrackRecordModal: true
        })
    }

    submit () {
        this.getPageInfoWithType();
        this.cancel()
    }

    cancel () {
        this.setState({
            openModal: false,
            openTrackRecordModal: false,
        })
    }

    resetPagination () {
        const pager = {...this.state.pagination};
        pager.pageNum = 1;
        pager.pageSize = this.configPageSize;
        pager.total = 0;
        return pager;
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

    // 改变tab
    changeTab (key) {
        const pager = this.resetPagination();
        this.setState({
            pagination: pager,
            tabType: Number(key),
        }, () => {
            this.getPageInfoWithType()
        });
    }

    getPageInfoWithType () {
        const key = this.state.tabType;
        switch (key) {
            case 1:
                this.getPersonalInfo();
                break;
            case 2:
                this.getContactInformationList();
                break;
            case 3:
                this.getContactPersonList();
                break;
            case 4:
                // 资产列表子业务请求，到时候剥离；
                break;
            case 5:
                this.getTrackList();
                this.getTrackPeopleProductList();
                break;
            default:
                break;
        }
    }

    // 查询融资人的产品列表
    async getTrackPeopleProductList () {
        const data = await Api('get', {
            serviceUrl: `borrowers/${this.id}/products`
        }, {
            borrowerId: this.id,
        });
        if(data.success) {
            this.setState({
                currentPeopleProductList: data.datas.content,
            })
        }
    }

    async changeSwitch (value, record) {
        if(this.isAjax) {
            message.info(this.tip.repeatClick);
            return
        }
        this.setState({
            isAjax: true
        });
        const data = await Api('put', {
            serviceUrl: `borrowers/${this.id}/contactinfo/default/${record.id}`
        });
        if (data.success) {
            message.success(this.tip.operateSuccess);
            // const {contactInformationList} = this.state;
            // contactInformationList.forEach(item => {
            //     item.isDefault = 0;
            //     if(item.id === record.id) {
            //         item.isDefault = value ? 1 : 0
            //     }
            // });
            // this.setState({
            //     contactInformationList: contactInformationList
            // })
            this.getContactInformationList();
        }
        this.setState({
            isAjax: false
        })
    }

    handleTabClick = async (key) => {
        if(Number(key) === 4) {
            // 案件列表需要跳转
            if(!this.state.userInfo) {
                await this.getPersonalInfo()
            }
            const win = window.open('about:blank');
            if(this.borrowerType === '1') {
                // 个人
                win.location.href= `/app/case?borrowerIdNum=${this.state.userInfo.bidcard}`
            } else {
                // 企业
                win.location.href= `/app/case?borrowerIdNum=${this.state.userInfo.bbusinesslicense}`
            }
        }
    };

    render () {
        const {
            userInfo,
            openModal,
            openTrackRecordModal,
            tabType,
            currentPeopleProductList
        } = this.state;
        const {
            withholdStatus,
            bankList,
            repaymentStatus,
            repaymentMethod,
            productType,
            contactStatus
        } = this.props.statusItemList;
        const page = this.state.pagination;
        const {
            financingPersonTrackingDetailBasic,
            financingPersonTrackingDetailAssetsList,
            financingPersonTrackingDetailContactPeople,
            financingPersonTrackingDetailContactPeopleAdd,
            financingPersonTrackingDetailContactWay,
            financingPersonTrackingDetailContactWayAdd,
            financingPersonTrackingDetailTrackList,
            financingPersonTrackingDetailTrackListAdd
        } = this.props.menuList.powerList;
        const lazyComponent = (<p style={{textAlign: 'center'}}>页签正在加载中...</p>);
        const { jumpUrl } = this.props.initListBtnCfg;

        return (
            <div>
                <Card>
                    <Tabs type="card"
                          onChange={this.changeTab.bind(this)}
                          onTabClick={this.handleTabClick}
                    >
                        {financingPersonTrackingDetailBasic && <TabPane tab="基础信息" key="1">
                            <Suspense fallback={lazyComponent}>
                                <DetailBaseInfo borrowerType={this.borrowerType}
                                                userInfo={userInfo}
                                                withholdStatus={withholdStatus}
                                                bankList={bankList}/>
                            </Suspense>
                        </TabPane>}
                        {financingPersonTrackingDetailAssetsList && <TabPane tab="案件列表" key="4">
                            {/*<Suspense fallback={lazyComponent}>*/}
                            {/*    <DetailAssetsList borrowerId={this.id}*/}
                            {/*                      tabType={this.state.tabType}*/}
                            {/*                      repaymentStatus={repaymentStatus}*/}
                            {/*                      repaymentMethod={repaymentMethod}*/}
                            {/*                      productType={productType}*/}
                            {/*                      jumpUrl={jumpUrl}*/}
                            {/*                      powerList={this.props.menuList.powerList}/>*/}
                            {/*</Suspense>*/}
                        </TabPane>}
                        {financingPersonTrackingDetailContactWay && <TabPane tab="个人联系方式" key="2">
                            <Suspense fallback={lazyComponent}>
                                <DetailContactWay
                                    onOpenAddContactsModal={this.openAddContactsModal.bind(this)}
                                    contactInformationList={this.state.contactInformationList}
                                    tableLoading={this.state.tableLoading}
                                    financingPersonTrackingDetailContactWayAdd={financingPersonTrackingDetailContactWayAdd}
                                    contactStatus={contactStatus}
                                    page={page}
                                    changeShowPageSize={ (current, pageSize) => {
                                        return this.changeShowPageSize(current, pageSize)
                                    }}
                                    changePageSize={ (current, pageSize) => {
                                        return this.changePageSize(current, pageSize)
                                    }}
                                    changeSwitch={(value, record) => {
                                        return this.changeSwitch(value, record)
                                    }}
                                />
                            </Suspense>
                        </TabPane>}
                        {financingPersonTrackingDetailContactPeople && <TabPane tab="其他联系人" key="3">
                            <Suspense fallback={lazyComponent}>
                                <DetailContactPeople
                                    onOpenAddContactsModal={this.openAddContactsModal.bind(this)}
                                    contactPersonList={this.state.contactPersonList}
                                    tableLoading={this.state.tableLoading}
                                    financingPersonTrackingDetailContactPeopleAdd={financingPersonTrackingDetailContactPeopleAdd}
                                    contactStatus={contactStatus}
                                    page={page}
                                    changeShowPageSize={ (current, pageSize) => {
                                        return this.changeShowPageSize(current, pageSize)
                                    }}
                                    changePageSize={ (current, pageSize) => {
                                        return this.changePageSize(current, pageSize)
                                    }}
                                />
                            </Suspense>
                        </TabPane>}
                        {financingPersonTrackingDetailTrackList && <TabPane tab="催记列表" key="5">
                            <Suspense fallback={lazyComponent}>
                                <DetailTrackList
                                    openTrackRecordModalFunc={this.openTrackRecordModalFunc.bind(this)}
                                    contactPersonList={this.state.trackList}
                                    tableLoading={this.state.tableLoading}
                                    financingPersonTrackingDetailTrackListAdd={financingPersonTrackingDetailTrackListAdd}
                                    page={page}
                                    changeShowPageSize={ (current, pageSize) => {
                                        return this.changeShowPageSize(current, pageSize)
                                    }}
                                    changePageSize={ (current, pageSize) => {
                                        return this.changePageSize(current, pageSize)
                                    }}
                                />
                            </Suspense>
                        </TabPane>}
                    </Tabs>
                </Card>
                <AddContactsModal
                    openModal={openModal}
                    type={tabType}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
                <TrackRecordModal
                    openModal={openTrackRecordModal}
                    type={tabType}
                    productInfo={currentPeopleProductList}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FinacingPersionTrackingDetail);
