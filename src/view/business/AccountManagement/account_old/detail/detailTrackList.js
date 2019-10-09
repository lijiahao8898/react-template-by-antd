import React, {Component} from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Link} from 'react-router-dom';
import {Button} from 'antd';
import TablePage from '@/component/tablePage/tablePage';
import {format} from '@/assets/js/common';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class DetailTrackList extends Component {

    openTrackRecordModalFunc () {
        this.props.openTrackRecordModalFunc()
    }

    render () {
        const {
            financingPersonTrackingDetailTrackListAdd,
            contactPersonList,
            tableLoading,
            page,
            changeShowPageSize,
            changePageSize
        } = this.props;

        const {
            appOverdueAssetsDetail
        } = this.props.menuList.powerList;

        const columns = [{
            title: '产品名称',
            dataIndex: 'productName',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                if (appOverdueAssetsDetail) {
                    return (
                        <Link to={`/app/case/detail/${record.productId}`} target="_blank">{text}</Link>
                    );
                } else {
                    return (<span>{text}</span>);
                }
            }
        }, {
            title: '类型',
            dataIndex: 'typeName',
            align: 'center',
            width: 100
        }, {
            title: '内容',
            dataIndex: 'message',
            align: 'center',
            width: 100
        }, {
            title: '结果',
            dataIndex: 'result',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{text ? text : '/'}</span>
                )
            }
        }, {
            title: '操作时间',
            dataIndex: 'createdon',
            align: 'center',
            width: 100,
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
            <React.Fragment>
                <div className="m-b-xs">
                    {financingPersonTrackingDetailTrackListAdd && <Button className="m-r-xs" type="primary" onClick={this.openTrackRecordModalFunc.bind(this)}>添加</Button>}
                </div>
                <TablePage
                    rowKey="id"
                    data={contactPersonList}
                    columns={columns}
                    loading={tableLoading}
                    pageOtherHeight="190"
                    pagination={{
                        current: page.pageNum,
                        pageSize: page.pageSize,
                        total: page.total,
                        onShowSizeChange: (current, pageSize) => {
                            return changeShowPageSize(current, pageSize);
                        },
                        onChange: (page, pageSize) => {
                            return changePageSize(page, pageSize);
                        }
                    }}
                />
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DetailTrackList);
