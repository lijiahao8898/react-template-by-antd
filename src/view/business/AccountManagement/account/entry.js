import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Tabs} from 'antd';
// tool
import Cookies from 'js-cookie';
import Api from '@/api/index';
// component
import JycCard from '@/component/jycCard/jycCard';
import Account from './index';
import MyAccount from './myAccount';

const {TabPane} = Tabs;

@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class AccountEntry extends React.Component {
    componentDidMount () {
        this.props.action.getPartner();                 // 委催方
        this.props.action.getOverdueStatus();           // 逾期状态
        this.props.action.getCaseTrackTypes();          // 催记类型
        this.props.action.getContactStatus();           // 可联状态
    }

    render () {
        const {allAccount, myAccount} = this.props.state.menuList.powerList;
        return (
            <JycCard>
                <Tabs type="card">
                    {myAccount && <TabPane tab="我的债户" key="1">
                        <MyAccount/>
                    </TabPane>}
                    {allAccount && <TabPane tab="全部债户" key="2">
                        <Account/>
                    </TabPane>}
                </Tabs>
            </JycCard>
        );
    }
}

export default AccountEntry;
