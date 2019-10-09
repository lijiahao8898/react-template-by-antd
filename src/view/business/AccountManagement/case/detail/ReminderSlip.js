import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button} from 'antd';
import TablePage from '@/component/tablePage/tablePage';
import {format, getColumnStatus, listDataProcessing} from '@/assets/js/common';
import globalCfg from '@/assets/js/config';
import SeparateModal from '../../account/modal/separateModal';
import {autobind} from 'core-decorators';
import Api from '@/api/index';
import qs from 'query-string';

// 分单
@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class BankList extends Component {
    constructor (props) {
        super(props);
        this.state = {
            openSeparateModal: false,
            selectedRows: [],
            trackerList: [],
            list: [],
            pagination: {
                pageSize: globalCfg.initialPage.pageSize,
                pageNum: 1,
                pageTotal: 20
            },
            caseInfo: {
                caseAmount: null,
                caseNum: null,
                debtNum: null
            }
        };
        this.borrowerId = props.match.params.id;    // 匹配页面的id
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.borrowerType = search.borrowerType;
            this.caseId = search.caseId;
        }
        this.openSeparateModal.bind(this);
    }

    componentDidMount () {
        this.getTrackerList();
        this.props.action.getCaseTrackTypes();          // 催记类型
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
                trackerList: arr
            });
        }
    }

    async getList () {
        const data = await Api('get', 'delegateList', {
            borrowerId: this.borrowerId
        });
        if (data.success) {
            this.setState({
                list: [...data.datas.content]
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
            this.props.onChangePage(pager);
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
            this.props.onChangePage(pager);
        });
    }

    // 弹框确定的回调
    @autobind
    submit () {
        this.setState({
            openSeparateModal: false,           // 分单
            selectedRowKeys: [],
            selectedRows: [],
        }, () => {
            this.getList();
        });
    }

    // 弹框取消的回调
    @autobind
    cancel () {
        this.setState({
            openSeparateModal: false,           // 分单
        });
    }

    @autobind
    async openSeparateModal () {
        const data = await Api('get', 'getCustomerCaseInfo', {
            borrowerId: this.borrowerId
        });
        if (data.success) {
            this.setState({
                caseInfo: Object.assign({}, this.state.caseInfo, data.datas.content),
                // 模拟数据
                selectedRows: [{
                    borrowerId: this.borrowerId,
                    repymtAmount: data.datas.content.caseAmount,
                    amount: 0
                }],
                openSeparateModal: true
            });
        }
    }

    render () {
        const {pagination, openSeparateModal, trackerList, selectedRows, list} = this.state;
        const {accountSeparateModalCode} = this.props.state.menuList.powerList;
        const tableList = listDataProcessing(list);
        const {caseTrackTypes} = this.props.state.statusItemList;
        const columns = [{
            title: '催收专员',
            dataIndex: 'trackerName',
            align: 'center',
            width: 200
        }, {
            title: '催收服务类型',
            dataIndex: 'delegateType',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatus(record.delegateType, caseTrackTypes, 'name', 'code')}</span>
                );
            }
        }, {
            title: '催收起始日',
            dataIndex: 'createdon',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                return (
                    <span>{record.createdon && format(new Date(record.createdon), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '催收截止日',
            dataIndex: 'modifiedon',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                return (
                    <span>{record.modifiedon && format(new Date(record.modifiedon), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '操作员',
            dataIndex: 'createdby',
            align: 'center',
            width: 100
        }];

        return (
            <div>
                <div className="m-b-xs">
                    {accountSeparateModalCode && <Button className="m-r-xs m-t-xs" type="primary" onClick={this.openSeparateModal}>分单</Button>}
                </div>
                <TablePage
                    rowKey="index"
                    data={tableList.list}
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
                <SeparateModal openModal={openSeparateModal} onOk={this.submit} onCancel={this.cancel} selectedRows={selectedRows}
                               caseTrackTypes={caseTrackTypes} trackerList={trackerList}/>
            </div>
        );
    }
}

export default withRouter(BankList);

