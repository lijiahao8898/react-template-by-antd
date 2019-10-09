import React, {Component, Suspense, lazy} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Card, Collapse, Icon} from 'antd';
// tool
import qs from 'query-string';
import Api from '@/api/index';
// component
const BaseInfo = lazy(() => import('./baseInfo'));
const AddressBook = lazy(() => import('./addressBook'));
const TrackList = lazy(() => import('../../trackList/index'));
const BankList = lazy(() => import('./bankList'));

const {Panel} = Collapse;
// 未加载完成的组件展示
const lazyComponent = (<p style={{textAlign: 'center'}}>页签正在加载中...</p>);

// 融资人详情
@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class AccountDetailEntry extends Component {
    constructor (props) {
        super(props);
        this.borrowerId = props.match.params.id;
        this.state = {
            userInfo: {},                   // 基本信息
            tableLoading: false,
            openModal: false,
            isAjax: false,
        };
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.borrowerType = search.borrowerType;
        }
    }

    componentDidMount () {
        this.props.action.getWithholdStatus();
        this.props.action.getBankList();
        this.props.action.getRepaymentStatus();
        this.props.action.getRepaymentMethod();
        this.props.action.getProductTypes();
        this.props.action.getContactStatus();
        this.getPersonalInfo();
    }

    // 获取用户基本信息
    async getPersonalInfo () {
        const data = await Api('GET', this.borrowerType === '1' ? 'getCustomerPersonalDetail' : 'getCustomerCompanyDetail', {
            borrowerId: this.borrowerId
        });
        if (data.success && data.datas) {
            this.setState({
                userInfo: data.datas.content
            });
        }
    }

    render () {
        const {userInfo} = this.state;
        const {statusItemList} = this.props.state;
        const {powerList} = this.props.state.menuList;
        const {withholdStatus, bankList, contactStatus} = statusItemList;
        const {
            accountDetailBase,
            accountDetailBank,
            accountDetailAddress,
            accountDetailTrackList
        } = powerList;
        const customPanelStyle = {
            background: '#fff',
            borderRadius: 4,
            marginBottom: 5,
            border: '1px solid #f2f7f7',
            overflow: 'hidden',
        };

        return (
            <Card>
                <Collapse
                    bordered={false}
                    defaultActiveKey={['1', '4']}
                    destroyInactivePanel={true}
                    expandIcon={({isActive}) => <Icon type="caret-right" rotate={isActive ? 90 : 0}/>}
                >

                    {accountDetailBase && <Panel header="债户" key="1" style={customPanelStyle}>
                        <Suspense fallback={lazyComponent}>
                            <BaseInfo
                                borrowerType={this.borrowerType}
                                borrowerId={this.borrowerId}
                                userInfo={userInfo}
                                withholdStatus={withholdStatus}
                                bankList={bankList}
                            />
                        </Suspense>
                    </Panel>}

                    {accountDetailBank && <Panel forceRender={true} header="债户银行卡" key="2" style={customPanelStyle}>
                        <Suspense fallback={lazyComponent}>
                            <BankList userInfo={userInfo} bankTypeList={bankList}/>
                        </Suspense>
                    </Panel>}

                    {accountDetailAddress && <Panel forceRender={true} header="债户通讯录" key="3" style={customPanelStyle}>
                        <Suspense fallback={lazyComponent}>
                            <AddressBook
                                borrowId={this.borrowerId}
                                borrowerType={this.borrowerType}
                                contactStatus={contactStatus}
                                powerList={powerList}
                                statusItemList={statusItemList}
                            />
                        </Suspense>
                    </Panel>}

                    {accountDetailTrackList && <Panel forceRender={true} header="催收记录" key="4" style={customPanelStyle}>
                        <Suspense fallback={lazyComponent}>
                            <TrackList/>
                        </Suspense>
                    </Panel>}

                </Collapse>
            </Card>
        );
    }
}

export default AccountDetailEntry;
