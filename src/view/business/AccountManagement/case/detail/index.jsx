import React, {Component, Suspense} from 'react';
import {Link} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Tabs, Button, Tooltip, Icon, List, Skeleton, Collapse} from 'antd';
import TrackRecordModal from '@/component/trackRecordModal/trackRecordModal';
import Api from '@/api/index';
import TablePage from '@/component/tablePage/tablePage';
import baseConfig from '@/assets/js/config';
import {toThousands, format, getColumnStatus} from '@/assets/js/common';
import JycCard from '@/component/jycCard/jycCard';
import RepaymentVoucherModal from './repaymentVoucherModal';
import {saveAs} from 'file-saver';
import qs from 'query-string';
import ImagesPreview from './imagesPreview'

// 基础信息
import BaseInfo from '../../account/detail/baseInfo';
// 银行卡列表
import BankList from '../../account/detail/bankList';
// 通讯录
import AddressBook from '../../account/detail/addressBook';
// 案件
import Case from './case';
// 债权
import Claims from './claims'
// 债权附件
import ClaimsFiles from './claimsFiles'
// 催收分单
import ReminderSlip from './ReminderSlip'
import TrackList from '../../trackList'

const {Panel} = Collapse;

const mapStateToProps = (state, ownProps) => {
    return {state: state};
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {action: bindActionCreators(action, dispatch)};
};

class OverdueAssetsDetail extends Component {
    constructor (props) {
        super(props);
        this.id = props.match.params.id;            // 匹配页面的id
        this.borrowerId = props.match.params.id;    // 匹配页面的id
        this.state = {
            userInfo: {},
            productInfo: {},                        // 产品信息
            productTracksList: [],                  // 跟踪记录
            RepaymentSchedsFiles: [],
            openModal: false,
            openRepaymentVoucherModal: false,
            currentRepaymentRecord: [],
            modalType: 1,
            pagination: {
                pageSize: baseConfig.initialPage.pageSize,
                pageNum: 1,
                total: 0
            },
            caseDetailInfo: {},                     // 案件详情信息
            debtDetailInfo: {},                     // 债权详情信息
        };
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.borrowerType = search.borrowerType;
            this.caseId = search.caseId;
            this.debtId = search.debtId;
        }
    }

    componentDidMount () {
        this.props.action.getWithholdStatus();
        this.props.action.getOverdueStatus();
        this.props.action.getProductTypes();
        this.props.action.getPartner();
        this.props.action.getBankList();
        this.props.action.getContactStatus();
        this.props.action.getRepaymentStatus();
        this.props.action.getRepaymentMethod();
        this.getPersonalInfo();
        this.getCaseDetail();
        this.getDebtDetail();
        this.getRepaymentSchedsFiles();
    }

    // 获取案件详情
    async getCaseDetail () {
        const data = await Api('GET', 'getCaseDetail', {
            id: this.caseId
        });
        if(data.success) {
            this.setState({
                caseDetailInfo: {...data.datas.content}
            })
        }
    }

    // 获取债权详情
    async getDebtDetail () {
        const data = await Api('GET', 'getDebtDetail', {
            id: this.debtId
        });
        if(data.success) {
            this.setState({
                debtDetailInfo: {...data.datas.content}
            })
        }
    }

    // 获取具体的还款凭证
    async getRepaymentSchedsFiles () {
        const data = await Api('get', 'getCaseReypmtenclosures', {
            id: this.caseId
        });
        if(data.success && data.datas) {
            this.setState({
                RepaymentSchedsFiles: data.datas.content
            })
        }
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

    submit () {
        this.getPageInfoWithType();
        this.cancel();
    }

    cancel () {
        this.setState({
            openModal: false,
            openRepaymentVoucherModal: false
        });
    }

    downloadFunc = (url, fileName) => {
        saveAs(url, fileName);
    };

    render () {
        const {
            productInfo,
            openModal,
            openRepaymentVoucherModal,
            currentRepaymentRecord,
            modalType,
            RepaymentSchedsFiles,
            userInfo,
            caseDetailInfo,
            debtDetailInfo
        } = this.state;
        const {statusItemList} = this.props.state;
        const {powerList} = this.props.state.menuList;
        const {withholdStatus, bankList, contactStatus, productType} = statusItemList;
        const {
            caseAccountInfoPower,
            caseBankListPower,
            caseContactListPower,
            caseClaimsPower,
            caseClaimsFilesPower,
            CaseCaseListPower,
            caseRepaymentSchedsFilesPower,
            caseReminderSlipPower,
            caseTrackListPower
        } = this.props.state.menuList.powerList;

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

        const customPanelStyle = {
            background: '#fff',
            borderRadius: 4,
            marginBottom: 5,
            border: '1px solid #f2f7f7',
            overflow: 'hidden',
        };

        return (
            <div>
                <JycCard>
                    <Collapse
                        bordered={false}
                        defaultActiveKey={['1']}
                        expandIcon={({isActive}) => <Icon type="caret-right" rotate={isActive ? 90 : 0}/>}
                    >
                        {caseAccountInfoPower && <Panel header="债户" key="1" style={customPanelStyle}>
                            <BaseInfo
                                borrowerType={this.borrowerType}
                                borrowerId={this.borrowerId}
                                userInfo={userInfo}
                                withholdStatus={withholdStatus}
                                bankList={bankList}
                            />
                        </Panel>}
                        {caseBankListPower && <Panel header="银行卡" key="2" forceRender={true} style={customPanelStyle}>
                            <BankList userInfo={userInfo} bankTypeList={bankList}/>
                        </Panel>}
                        {caseContactListPower && <Panel header="通讯录" key="3" forceRender={true} style={customPanelStyle}>
                            <AddressBook borrowId={this.id} contactStatus={contactStatus} powerList={powerList} statusItemList={statusItemList}/>
                        </Panel>}
                        {caseClaimsPower && <Panel header="债权" key="4" forceRender={true} style={customPanelStyle}>
                            <Claims debtDetailInfo={debtDetailInfo} productType={productType}/>
                        </Panel>}
                        {caseClaimsFilesPower && <Panel header="债权附件" key="5" forceRender={true} style={customPanelStyle}>
                            <ClaimsFiles userInfo={productInfo} bankList={bankList} />
                        </Panel>}
                        {CaseCaseListPower && <Panel header="案件" key="6" forceRender={true} style={customPanelStyle}>
                            <Case caseDetailInfo={caseDetailInfo} productType={productType}/>
                        </Panel>}
                        {caseRepaymentSchedsFilesPower && <Panel header="还款凭证" key="7" style={customPanelStyle}>
                            <ImagesPreview RepaymentSchedsFiles={RepaymentSchedsFiles} />
                        </Panel>}
                        {caseReminderSlipPower && <Panel header="催收分单" key="8" forceRender={true} style={customPanelStyle}>
                            <ReminderSlip userInfo={productInfo} bankList={bankList} />
                        </Panel>}
                        {caseTrackListPower && <Panel header="催收记录" key="9" forceRender={true} style={customPanelStyle}>
                            <TrackList/>
                        </Panel>}
                    </Collapse>
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
