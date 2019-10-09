import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Tabs} from 'antd';
// component
import JycCard from '@/component/jycCard/jycCard';
import Case from './index';
import MyCase from './myCase';

const {TabPane} = Tabs;

@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class CaseEntry extends React.Component {

    componentDidMount () {
        this.props.action.getPartner();                 // 委催方
        this.props.action.getOverdueStatus();           // 逾期状态
        this.props.action.getCaseTrackTypes();          // 催记类型
    }

    render () {
        const {allCase, myCase} = this.props.state.menuList.powerList;
        return (
            <JycCard>
                <Tabs type="card">
                    {myCase && <TabPane tab="我的案件" key="1">
                        <MyCase/>
                    </TabPane>}
                    {allCase && <TabPane tab="全部案件" key="2">
                        <Case/>
                    </TabPane>}
                </Tabs>
            </JycCard>
        );
    }
}

export default CaseEntry;
