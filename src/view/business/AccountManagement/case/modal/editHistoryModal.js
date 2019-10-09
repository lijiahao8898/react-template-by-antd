import React from 'react';
import {Modal, Button} from 'antd';
import TablePage from '@/component/tablePage/tablePage';
import {initialPage} from '@/assets/js/config'
import {format, getColumnStatus, listDataProcessing} from '@/assets/js/common';

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
    modalCancel () {
        this.props.onCancel();
    }

    render () {
        const {openEditHistoryModal} = this.props;
        const {pagination} = this.state;
        const columns = [{
            title: '时间',
            dataIndex: 'khbankcode',
            align: 'center',
            width: 200
        }, {
            title: '操作员',
            dataIndex: 'yuliumobile',
            align: 'center',
            width: 100
        }, {
            title: '内容',
            dataIndex: 'people',
            align: 'center',
            width: 100
        }];

        return (
            <Modal
                title="编辑历史"
                maskClosable={false}
                centered={true}
                visible={openEditHistoryModal}
                onCancel={this.modalCancel.bind(this)}
                width="700px"
                footer={[
                    <Button key="back" onClick={this.modalCancel.bind(this)}>取消</Button>,
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
