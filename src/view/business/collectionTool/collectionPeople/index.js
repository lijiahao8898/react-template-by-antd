import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button, Popconfirm, message, Icon} from 'antd';
import {autobind} from 'core-decorators';
import Api from '@/api';
// tool
import {initialPage, tip, textMap} from '@/assets/js/config';
// component
import TablePage from '@/component/tablePage/tablePage';
import JycCard from '@/component/jycCard/jycCard';
// modal
import PeopleModal from './peopleModal';

// 催服专员管理
@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class CollectionPeople extends Component {
    constructor (props) {
        super(props);
        this.state = {
            openModal: false,
            pagination: {
                pageSize: initialPage.pageSize,
                pageNum: 1,
                pageTotal: 0
            },
            operateType: 1,                 // 1 新增，2 修改
            currentRecord: {},
            trackerList: []
        };
    }

    componentDidMount () {
        this.getPeopleList();
    }

    async getPeopleList () {
        const {pagination} = this.state;
        const data = await Api('get', 'trackerList', {
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize
        });
        if (data.success) {
            this.setState({
                trackerList: [...data.datas.content],
                pagination: Object.assign({}, this.state.pagination, {
                    pageTotal: data.datas.total
                })
            });

        }
    }

    // 翻页
    changePageSize (page, pageSize) {
        const pager = {...this.state.pagination};
        pager.pageNum = page;
        this.setState({
            pagination: pager
        }, () => {
            this.getPeopleList();
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
            this.getPeopleList();
        });
    }

    @autobind
    openPeopleModal (type, record) {
        this.setState({
            openModal: true,
            operateType: Number(type),
            currentRecord: record
        });
    }

    @autobind
    handleCloseModal () {
        this.setState({
            openModal: false
        });
    }

    @autobind
    handleOkModal () {
        this.setState({
            openModal: false
        }, () => {
            this.getPeopleList();
        });
    }

    @autobind
    async handleConfirm (record) {
        const data = await Api('DELETE', 'updateTracker', {
            id: record.id
        });
        if (data.success) {
            message.success(tip.operateSuccess);
            this.getPeopleList();
        }
    }

    @autobind
    async handleRefreshUserInfo (phone) {
        const data = await Api('GET', 'getTrackerAuth', {
            mobile: phone
        });
        if (data.success) {
            message.success(tip.operateSuccess);
            this.getPeopleList();
        }
    }

    render () {
        const {pagination, openModal, trackerList, operateType, currentRecord} = this.state;
        const {
            collectionPeopleAddCode,
            collectionPeoplePutCode,
            collectionPeopleDeleteCode,
        } = this.props.state.menuList.powerList;
        const columns = [{
            title: '专员名称',
            dataIndex: 'trackerName',
            align: 'center',
            width: 120
        }, {
            title: '联系手机',
            dataIndex: 'trackerMobile',
            align: 'center',
            width: 120,
        }, {
            title: '钉钉账号',
            dataIndex: 'dingdingNum',
            align: 'center',
            width: 120,
        }, {
            title: '用户中心已注册',
            dataIndex: 'authStatus',
            align: 'center',
            width: 120,
            render: (text, record, index) => {
                return (
                    <div>{text === 1 ? '是' : '否'}
                        <Button type='primary' className='m-l-md' size='small' ghost onClick={() => this.handleRefreshUserInfo(record.trackerMobile)}>刷新</Button>
                    </div>
                );
            }
        }, {
            title: '操作',
            align: 'center',
            width: 120,
            render: (text, record, index) => {
                return (
                    <div>
                        {collectionPeoplePutCode &&
                        <Button type='primary' className='m-r-xs' size='small' onClick={() => this.openPeopleModal(2, record)} ghost>{textMap.update}</Button>}
                        {collectionPeopleDeleteCode && <Popconfirm
                            placement='topRight'
                            title={`是否删除选中的专员【${record.trackerName}】？`}
                            onConfirm={() => this.handleConfirm(record)}
                            okText={textMap.popConfirmOk}
                            cancelText={textMap.popConfirmCancel}
                        >
                            <Button type='primary' size='small' ghost>{textMap.delete}</Button>
                        </Popconfirm>}
                    </div>
                );
            }
        }];

        return (
            <JycCard>
                <div className="m-b-xs">
                    {collectionPeopleAddCode && <Button className="m-r-xs" type="primary" onClick={() => this.openPeopleModal(1)}>{textMap.add}</Button>}
                </div>
                <TablePage
                    rowKey="id"
                    data={trackerList}
                    columns={columns}
                    pageOtherHeight="190"
                    pagination={{
                        current: pagination.pageNum,
                        pageSize: pagination.pageSize,
                        total: pagination.pageTotal,
                        onShowSizeChange: (current, pageSize) => {
                            return this.changeShowPageSize(current, pageSize);
                        },
                        onChange: (page, pageSize) => {
                            return this.changePageSize(page, pageSize);
                        }
                    }}
                />
                <PeopleModal openModal={openModal} operateType={operateType} record={currentRecord} onCancel={this.handleCloseModal} onOk={this.handleOkModal}/>
            </JycCard>
        );
    }
}

export default CollectionPeople;
