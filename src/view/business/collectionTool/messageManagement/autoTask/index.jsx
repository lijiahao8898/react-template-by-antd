import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button, Icon, Tooltip, Popconfirm, Switch, message} from 'antd';
import Api from '@/api/index';
import TablePage from '@/component/tablePage/tablePage';
import AddModal from './addModal';
import {format} from '@/assets/js/common';
import baseConfig from '@/assets/js/config';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class AutoTask extends Component {
    constructor (props) {
        super(props);
        const {tip} = baseConfig;
        this.state = {
            list: [],                       // 列表数据
            tableLoading: false,
            openModal: false,
            currentRecord: {}
        };
        this.tip = tip;
    }

    componentDidMount () {
        this.getList();
    }

    resetItem () {
        this.setState({tableLoading: true,});
    }

    async getList () {
        this.resetItem();
        const data = await Api('get', 'getSmsTasks');
        this.setState({tableLoading: false});
        if (data.success) {
            this.setState({list: data.datas.content,});
        }
    }

    // 打开罚息减免
    openTemplateModal () {
        this.setState({
            openModal: true
        });
    }

    // 更新
    update (value) {
        if (value === 'true') {
            this.getList();
        }
        this.cancel();
    }

    submit () {
        this.getList();
        this.cancel();
    }

    // 取消
    cancel () {
        this.setState({
            openModal: false,
            currentRecord: {}
        });
    }

    editItem (record) {
        this.setState({
            currentRecord: record,
            openModal: true
        });
    }

    async deleteItem (record) {
        const data = await Api('delete', {
            serviceUrl: `sms/tasks/${record.id}`
        });
        if (data.success) {
            message.success(this.tip.operateSuccess);
            this.getList();
        }
    }

    async onChange (value, record) {
        console.log(value);
        console.log(record);
        const data = await Api('put', {
            serviceUrl: `sms/tasks/${record.id}/status`
        }, {
            enable: value ? 1 : 0,
            taskId: record.id
        });
        if (data.success) {
            message.success(this.tip.operateSuccess);
            const {list} = this.state;
            list.forEach(item => {
                if(item.id === record.id) {
                    console.log(1);
                    item.enable = value ? 1 : 0
                }
            });
            this.setState({
                list: list
            })
        }
    }

    render () {
        const {
            messageManagementAutoTaskAdd,
            messageManagementAutoTaskEdit,
            messageManagementAutoTaskDelete
        } = this.props.menuList.powerList;
        const {openModal, currentRecord} = this.state;
        const columns = [{
            title: '启用',
            dataIndex: 'id',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                return (
                    <Switch size="small" checked={record.enable === 1} onChange={(value) => {
                        this.onChange(value, record);
                    }}/>
                );
            }
        }, {
            title: '任务名称',
            dataIndex: 'taskName',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                if (text && text.length >= 15) {
                    return (
                        <Tooltip placement="top" overlayClassName="overlay" overlayStyle={{maxWidth: '300px'}} title={<div>{text}</div>}>
                            <div className="list-base">{text}</div>
                        </Tooltip>
                    );
                } else {
                    return (
                        <div className="list-base">{text}</div>
                    );
                }
            }

        }, {
            title: '发送日期',
            dataIndex: 'sendDate',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                return (
                    <span>T{text}</span>
                );
            }
        }, {
            title: '发送时间',
            dataIndex: 'sendHour',
            align: 'center',
            width: 80,
            render: (text, record, index) => {
                return (
                    <span>{record.sendHour}:{record.sendMinute}</span>
                );
            }
        }, {
            title: '模板名称',
            dataIndex: 'tmplName',
            align: 'center',
            className: 'error',
            width: 150,
            render: (text, record, index) => {
                if (text && text.length >= 15) {
                    return (
                        <Tooltip placement="top" overlayClassName="overlay" overlayStyle={{maxWidth: '300px'}} title={<div>{text}</div>}>
                            <div className="list-base">{text}</div>
                        </Tooltip>
                    );
                } else {
                    return (
                        <div className="list-base">{text}</div>
                    );
                }
            }
        }, {
            title: '渠道合作方',
            dataIndex: 'partnerId',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                if (text) {
                    const arr = record.partnerName.split(',');
                    return (
                        <Tooltip placement="right" overlayClassName="overlay" overlayStyle={{maxWidth: '300px'}} title={arr.map((item, i) => {
                            return (<p key={i} style={{marginBottom: '2px'}}>{item}</p>);
                        })}>
                            <a>{arr.length}</a>
                        </Tooltip>
                    );
                } else {
                    return null;
                }
            }
        }, {
            title: '操作时间',
            dataIndex: 'modifiedon',
            align: 'center',
            width: 140,
            render: (text, record, index) => {
                return (
                    <span>{record.modifiedon && format(new Date(record.modifiedon), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '操作员',
            dataIndex: 'modifiedby',
            align: 'center',
            width: 80,
        }, {
            title: '操作',
            dataIndex: 'newBalance',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <div>
                        {messageManagementAutoTaskEdit && <Button className="m-r-xs" type="primary" size="small" ghost onClick={this.editItem.bind(this, record)}>修改</Button>}
                        {messageManagementAutoTaskDelete && <Popconfirm
                            title={`真的要删除【${record.taskName}】吗？`}
                            okText="确定"
                            cancelText="取消"
                            placement="left"
                            onConfirm={this.deleteItem.bind(this, record)}
                        >
                            <Button type="primary" size="small" ghost>删除</Button>
                        </Popconfirm>}
                    </div>
                );
            }
        }];
        const {list, tableLoading} = this.state;
        return (
            <div>
                <div className="m-b-xs">
                    {messageManagementAutoTaskAdd && <Button className="m-r-xs" type="primary" onClick={this.openTemplateModal.bind(this)}>添加</Button>}
                </div>
                <TablePage
                    rowKey={'id'}
                    pageOtherHeight={95}
                    data={list}
                    columns={columns}
                    loading={tableLoading}
                />
                <AddModal
                    openModal={openModal}
                    currentRecord={currentRecord}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoTask);
