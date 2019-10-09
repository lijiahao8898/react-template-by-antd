import React, {Component} from 'react';
import {Button} from 'antd';
import {withRouter} from 'react-router-dom'
// tool
import {autobind} from 'core-decorators';
import qs from 'query-string';
import {initialPage} from '@/assets/js/config';
import {format, getColumnStatus} from '@/assets/js/common';
import Api from '@/api/index';
// component
import TablePage from '@/component/tablePage/tablePage';
import AddBankModal from './modal/addBankModal';
import AddModal from '../../../collectionTool/autoDetection/addModal/addModal';

// 银行卡列表（个人和企业）
class BankList extends Component {
    constructor (props) {
        super(props);
        this.state = {
            bankList: [],
            pagination: {
                pageSize: initialPage.pageSize,
                pageNum: 1,
                pageTotal: 20
            },
            tableLoading: false,
            openAddBankModal: false,
            currentRecord: null
        };
        this.id = props.match.params.id;
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.borrowerType = search.borrowerType;
        }
    }

    componentDidMount () {
        this.getBankList()
    }

    async getBankList () {
        this.setState({
            tableLoading: true
        });
        const data = await Api('GET', 'getCustomerBankList', {
            borrowerId: this.id
        });
        this.setState({
            tableLoading: false
        });
        if(data.success) {
            this.setState({
                bankList: data.datas.content
            })
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

    @autobind
    openAddBankModal (type, currentRecord) {
        this.setState({
            openAddBankModal: true,
            currentRecord
        })
    }

    @autobind
    submit () {
        this.getBankList();
        this.cancel();
    }

    @autobind
    cancel () {
        this.setState({
            openAddBankModal: false,
            currentRecord: null
        })
    }

    render () {
        const {userInfo, bankTypeList} = this.props;
        const {pagination, bankList, openAddBankModal, tableLoading, currentRecord} = this.state;
        const columns = [{
            title: '银行账号',
            dataIndex: 'kHBankCode',
            align: 'center',
            width: 200
        }, {
            title: '是否代扣卡',
            dataIndex: 'isWithholdCard',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.isWithholdCard === 1 ? '是' : '否'}</span>
                );
            }
        }, {
            title: '开户行',
            dataIndex: 'bank',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatus(record.bank, bankTypeList, 'name', 'code')}</span>
                );
            }
        }, {
            title: '预留手机号',
            dataIndex: 'yuLiuMobile',
            align: 'center',
            width: 100
        }, {
            title: '更新时间',
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
            dataIndex: 'createby',
            align: 'center',
            width: 100
        }, {
            title: '操作',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <Button type='primary' size='small' ghost onClick={() => this.openAddBankModal('update', record)}>修改</Button>
                );
            }
        }];

        return (
            <div>
                <div className="m-b-xs">
                    <Button className="m-r-xs" type="primary" onClick={this.openAddBankModal}>添加</Button>
                </div>
                <TablePage
                    rowKey="id"
                    data={bankList}
                    columns={columns}
                    loading={tableLoading}
                    pageOtherHeight="190"
                    // pagination={{
                    //     current: pagination.pageNum,
                    //     pageSize: pagination.pageSize,
                    //     total: pagination.pageTotal,
                    //     onShowSizeChange: (current, pageSize) => {
                    //         return this.changeShowPageSize(current, pageSize);
                    //     },
                    //     onChange: (page, pageSize) => {
                    //         return this.changePageSize(page, pageSize);
                    //     }
                    // }}
                />
                <AddBankModal openModal={openAddBankModal}
                              currentRecord={currentRecord}
                              borrowerId={this.id}
                              onOk={this.submit.bind(this)}
                              onCancel={this.cancel.bind(this)}>
                </AddBankModal>
            </div>
        );
    }
}

export default withRouter(BankList);

