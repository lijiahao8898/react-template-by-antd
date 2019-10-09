import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Layout, BackTop, Icon} from 'antd';
import './index.scss';
// component
import Sidebar from '@/component/sidebar/sidebar';
import Header from '@/component/header/header';
// import PageLoading from '@/component/pageLoading/pageLoading';
import Home from '@/view/business/home/home';
import ResetPwd from '@/view/resetPwd/resetPwd';

// 账户管理
// 账户列表
import Account from '@/view/business/AccountManagement/account_old/index';
import AccountEntry from '@/view/business/AccountManagement/account/entry';
// 账户详情
import AccountDetail from '@/view/business/AccountManagement/account_old/detail/index';
import AccountDetailNew from '@/view/business/AccountManagement/account/detail/index';
// 案件列表
import Case from '@/view/business/AccountManagement/case_old/index';
import CaseEntry from '@/view/business/AccountManagement/case/entry';
// 案件详情
import CaseDetail from '@/view/business/AccountManagement/case_old/detail/detail';
import CaseDetailNew from '@/view/business/AccountManagement/case/detail/index';
// 催还计划
import overduePlan from '@/view/business/AccountManagement/overduePlan/index';

// 催收工具
// 失联探测配置
import CollectionToolAutoDetection from '@/view/business/collectionTool/autoDetection/index';
// 短信管理
import MessageManagement from '@/view/business/collectionTool/messageManagement/index';
// const Channel = lazy(() => import('@/view/business/overdueAssets/index'));
import CollectionPeople from '@/view/business/collectionTool/collectionPeople/index';
import TrackList from '@/view/business/AccountManagement/trackList/index';

const {Content} = Layout;

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        action: bindActionCreators(action, dispatch)
    };
};

class Index extends Component {
    constructor (props) {
        super(props);
        this.state = {
            collapsed: false,
        };
    }

    componentDidMount () {
        this.props.action.getMenuList();
        this.props.action.initGlobalConfig();
        this.props.action.initGlobalJumpUrl();
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    render () {
        let {match, menuList} = this.props;
        return (
            <Layout style={{minHeight: '100vh'}}>
                <Sidebar collapsed={this.state.collapsed} onCollapse={this.toggle}/>
                <Layout>
                    <Header className="header">
                        <Icon
                            className="trigger"
                            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.toggle}/>
                    </Header>
                    <Content className="content">
                        {menuList.menu.childrens.length > 0 && <div>
                            <Switch>
                                <Route exact path={`${match.url}/index`} component={Home}/>

                                <Route exact path={`${match.url}/case`} component={Case}/>
                                <Route path={`${match.url}/case/detail/:id`} component={CaseDetail}/>
                                <Route exact path={`${match.url}/case_new`} component={CaseEntry}/>
                                <Route path={`${match.url}/case_new/detail/:id`} component={CaseDetailNew}/>

                                <Route exact path={`${match.url}/account`} component={Account}/>
                                <Route path={`${match.url}/account/detail/:id`} component={AccountDetail}/>
                                <Route exact path={`${match.url}/account_new`} component={AccountEntry}/>
                                <Route path={`${match.url}/account_new/detail/:id`} component={AccountDetailNew}/>

                                <Route path={`${match.url}/collectionTool/autoDetection`} component={CollectionToolAutoDetection}/>
                                <Route path={`${match.url}/messageManagement`} component={MessageManagement}/>
                                <Route path={`${match.url}/collectionPeople`} component={CollectionPeople}/>

                                <Route path={`${match.url}/overduePlan`} component={overduePlan}/>

                                <Route path={`${match.url}/ResetPassword`} component={ResetPwd}/>∂
                                <Route path={`${match.url}/trackList`} component={TrackList}/>∂
                            </Switch>
                        </div>}
                        <BackTop/>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Index);
