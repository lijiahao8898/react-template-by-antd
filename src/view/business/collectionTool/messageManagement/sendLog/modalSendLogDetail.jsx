import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Modal, Button} from 'antd';
import TablePage from '@/component/tablePage/tablePage';
import {format} from '@/assets/js/common';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class ModalSendLogDetail extends Component {
    // constructor (props) {
    //     super(props);
    // }

    // 翻页
    changePageSize (page, pageSize) {
        const pager = {...this.props.modalPagination};
        pager.pageNum = page;
        this.props.handleChangePageSize(pager);
    }

    // 改变展示的页数
    changeShowPageSize (current, pageSize) {
        const pager = {...this.state.modalPagination};
        pager.pageSize = pageSize;
        pager.pageNum = 1;
        this.props.handleChangeShowPageSize(pager);
    }

    setColumnsKey () {
        const list = [];
        this.props.modalList.forEach((item, index) => {
            item.index = index;
            list.push(item);
        });

        return {
            list
        };
    }

    // 取消
    modalCancel () {
        this.props.onCancel();
    }

    render () {
        const {openModal, modalTableLoading, modalPagination} = this.props;
        const {pageNum, pageSize, total} = modalPagination;
        const {list} = this.setColumnsKey();
        const columns = [{
            title: '融资人',
            dataIndex: 'borrowerName',
            align: 'center',
            width: 100
        }, {
            title: '手机号',
            dataIndex: 'mobile',
            align: 'center',
            width: 100,
        }, {
            title: '渠道合作方',
            dataIndex: 'partnerName',
            align: 'center',
            width: 180
        },  {
            title: '状态',
            dataIndex: 'respMsg',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                if(Number(record.respCode) === 0 ) {
                    return (
                        <span>{text}</span>
                    )
                } else {
                    return (
                        <span style={{color: '#cf1322'}}>{text}</span>
                    );
                }
            }
        },  {
            title: '提交时间',
            dataIndex: 'createdon',
            align: 'center',
            width: 120,
            render: (text, record, index) => {
                return (
                    <span>{record.createdon && format(new Date(record.createdon), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, ];
        return (
            <Modal
                title="日志详情"
                centered={true}
                visible={openModal}
                onCancel={this.modalCancel.bind(this)}
                width={1000}
                footer={[
                    <Button key="back" onClick={this.modalCancel.bind(this)}>关闭</Button>
                ]}>
                    <TablePage
                        rowKey="index"
                        data={list}
                        columns={columns}
                        loading={modalTableLoading}
                        pageSizeOptions={['10']}
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
            </Modal>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalSendLogDetail);
