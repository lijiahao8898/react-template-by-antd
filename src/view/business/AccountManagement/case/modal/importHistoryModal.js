import React from 'react';
import {Modal, Button} from 'antd';
// tool
import {initialPage} from '@/assets/js/config'
import {format, getColumnStatus} from '@/assets/js/common';
import {autobind} from 'core-decorators'
// component
import TablePage from '@/component/tablePage/tablePage';

// 导入历史
class ImportHistoryModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            pagination: {
                pageNum: 1,
                pageSize: initialPage.modalPageSize,
                pageTotal: 0
            }
        }
    }

    // 取消
    @autobind
    modalCancel () {
        this.props.onCancel();
    }

    render () {
        const {openImportHistoryModal} = this.props;
        const {pagination} = this.state;
        const columns = [{
            title: '操作时间',
            dataIndex: 'khbankcode',
            align: 'center',
            width: 200
        }, {
            title: '导入类型',
            dataIndex: 'isshouxuan',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.isshouxuan === 1 ? '是' : '否'}</span>
                );
            }
        }, {
            title: '文件名称',
            dataIndex: 'bank',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>1</span>
                );
            }
        }, {
            title: '总数量',
            dataIndex: 'yuliumobile',
            align: 'center',
            width: 100
        }, {
            title: '已处理',
            dataIndex: 'createtime',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                return (
                    <span>{record.createtime && format(new Date(record.createtime), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '出错数据',
            dataIndex: 'people',
            align: 'center',
            width: 100
        }];

        return (
            <Modal
                title="我的导入历史"
                maskClosable={false}
                centered={true}
                visible={openImportHistoryModal}
                onCancel={this.modalCancel}
                width="800px"
                footer={[
                    <Button key="back" onClick={this.modalCancel}>取消</Button>,
                ]}>
                <TablePage
                    rowKey="index"
                    data={[]}
                    columns={columns}
                    height={600}
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
            </Modal>
        );
    }
}

export default ImportHistoryModal;
