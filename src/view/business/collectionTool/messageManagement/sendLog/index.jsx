import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {message} from 'antd';
import Api from '@/api/index';
import TablePage from '@/component/tablePage/tablePage';
import PageLoading from '@/component/pageLoading/pageLoading';
import baseConfig from '@/assets/js/config';
import {format} from '@/assets/js/common';
import ModalSendLogDetail from './modalSendLogDetail';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class SendLog extends Component {
    constructor (props) {
        super(props);
        this.state = {
            list: [],
            tableLoading: false,
            pageLoading: false,
            openModal: false,
            currentId: null,
            searchParams: {},
            pagination: {
                pageSize: baseConfig.initialPage.pageSize,
                pageNum: 1,
                total: 0
            },
            modalList: [],
            modalTableLoading: [],
            modalPagination: {
                pageSize: baseConfig.initialPage.modalPageSize,
                pageNum: 1,
                total: 0
            },
            isSearch: false,        // 是否搜索
        };
    }

    componentDidMount () {
        this.getList();
    }

    // 列表
    async getList () {
        const pager = {...this.state.pagination};
        const searchParams = {...this.state.searchParams};
        this.setState({
            tableLoading: true,
            isSearch: true,
        });
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        Object.assign(params, searchParams);
        const data = await Api('get', 'getLog', params);
        this.setState({tableLoading: false});
        if (data.success) {
            pager.total = data.datas.total;
            this.setState({
                list: data.datas.content,
                pagination: pager
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
            this.getList();
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
            this.getList();
        });
    }

    async exportList () {
        if(!this.state.isSearch) {
            message.info(baseConfig.tip.exportWithNoSearch);
            return;
        }
        const params = Object.assign({}, this.state.params, this.state.searchParams);
        this.setState({pageLoading: true});
        delete params.total;
        await Api('link', 'borrowerListExport', params);
        this.setState({pageLoading: false});
    }

    setColumnsKey () {
        const list = [];
        this.state.list.forEach((item, index) => {
            item.index = index;
            list.push(item);
        });

        return {
            list
        };
    }

    openModalSendLogDetail (id) {
        this.setState({
            currentId: id,
            openModal: true
        }, () => {
            this.getLogDetailList();
        })
    }

    async getLogDetailList () {
        const pager = {...this.state.modalPagination};
        this.setState({
            modalTableLoading: true
        });
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        const data = await Api('get', {
            serviceUrl: `sms/logs/${this.state.currentId}`
        }, params) ;
        this.setState({modalTableLoading: false});
        if (data.success) {
            pager.total = data.datas.total;
            this.setState({
                modalList: data.datas.content,
                modalPagination: pager
            });
        }
    }

    handleChangePageSize (pager) {
        this.setState({
            modalPagination: pager
        }, () => {
            this.getLogDetailList();
        })
    }

    handleChangeShowPageSize (pager) {
        this.setState({
            modalPagination: pager
        }, () => {
            this.getLogDetailList();
        })
    }

    // 取消
    cancel () {
        const pager = {...this.state.modalPagination};
        pager.pageNum = 1;
        this.setState({
            openModal: false,
            currentId: null,
            modalPagination: pager
        });
    }

    render () {
        const {pageNum, pageSize, total} = this.state.pagination;
        const {tableLoading, pageLoading, openModal, modalList, modalPagination, modalTableLoading} = this.state;
        const {messageManagementSendLogDetail} = this.props.menuList.powerList;
        const {list} = this.setColumnsKey();
        const columns = [{
            title: '方式',
            dataIndex: 'typeName',
            align: 'center',
            width: 100
        }, {
            title: '模板名称',
            dataIndex: 'tmplName',
            align: 'center',
            width: 150,
        }, {
            title: '发送数量',
            dataIndex: 'totalCount',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                if(messageManagementSendLogDetail) {
                    if(text > record.successCount) {
                        return (
                            <a style={{color: '#cf1322'}} onClick={this.openModalSendLogDetail.bind(this, record.id)}>{record.successCount}&nbsp;/&nbsp;{text}</a>
                        );
                    } else {
                        return (
                            <a onClick={this.openModalSendLogDetail.bind(this, record.id)}>{record.successCount}&nbsp;/&nbsp;{text}</a>
                        );
                    }
                } else {
                    return (
                        <span>{record.successCount}&nbsp;/&nbsp;{text}</span>
                    )
                }
            }
        }, {
            title: '操作时间',
            dataIndex: 'createdon',
            align: 'center',
            width: 120,
            render: (text, record, index) => {
                return (
                    <span>{record.createdon && format(new Date(record.createdon), 'yyyy-MM-dd hh:mm:ss')}</span>
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
                <TablePage
                    rowKey="index"
                    pageOtherHeight={95}
                    data={list}
                    columns={columns}
                    loading={tableLoading}
                    pagination={{
                        current: pageNum,
                        pageSize: pageSize,
                        total: total,
                        onShowSizeChange: (current, pageSize) => {
                            return this.changeShowPageSize(current, pageSize);
                        },
                        onChange: (page, pageSize) => {
                            return this.changePageSize(page, pageSize);
                        }
                    }}
                />
                <ModalSendLogDetail
                    openModal={openModal}
                    modalList={modalList}
                    modalPagination={modalPagination}
                    modalTableLoading={modalTableLoading}
                    handleChangePageSize={this.handleChangePageSize.bind(this)}
                    handleChangeShowPageSize={this.handleChangeShowPageSize.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
                <PageLoading loading={pageLoading}>
                    <span>{baseConfig.tip.exporting}</span>
                </PageLoading>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendLog);
