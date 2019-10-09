import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Card, Tabs} from 'antd';

import MessageTemplate from './template/index';
import MessageAutoTask from './autoTask/index';
import SendLog from './sendLog/index';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

const TabPane = Tabs.TabPane;

// 短信管理
class MessageManagement extends React.Component {

    changeTab = (key) => {

    };

    render () {
        const {
            appMessageManagementAutoTask,
            appMessageManagementSendLog,
            appMessageManagementTemplate
        } = this.props.menuList.powerList;
        return (
            <Card>
                <Tabs type="card" onChange={this.changeTab}>
                    {appMessageManagementTemplate && <TabPane tab="模板配置" key="1">
                        <MessageTemplate/>
                    </TabPane>}
                    {appMessageManagementAutoTask && <TabPane tab="自动发送" key="2">
                        <MessageAutoTask/>
                    </TabPane>}
                    {appMessageManagementSendLog && <TabPane tab="发送日志" key="3">
                        <SendLog/>
                    </TabPane>}
                </Tabs>
            </Card>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageManagement)
