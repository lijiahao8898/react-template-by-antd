import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {Button, Icon, Tooltip, Popconfirm, message} from 'antd';
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

class Channel extends Component {
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
        const data = await Api('get', 'getSmsTemplates');
        this.setState({tableLoading: false});
        if (data.success) {
            this.setState({list: data.datas.content,});
        }
    }

    openTemplateModal () {
        this.setState({
            openModal: true
        });
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

    async deleteTemplate (record) {
        const data = await Api('delete', {
            serviceUrl: `sms/templates/${record.id}`
        });
        if(data.success) {
            message.success(this.tip.operateSuccess);
            this.getList();
        }
    }

    editTemplate (record) {
        this.setState({
            currentRecord: record,
            openModal: true
        })
    }

    render () {
        const {
            messageManagementTemplateAdd,
            messageManagementTemplateEdit,
            messageManagementTemplateDelete
        } = this.props.menuList.powerList;
        const {openModal, currentRecord} = this.state;
        const columns = [{
            title: '模板名称',
            dataIndex: 'tmplName',
            align: 'center',
            width: 140,
        }, {
            title: () => {
                return (
                    <div>模板内容&nbsp;
                        <Tooltip placement="right" title={(<div>
                            <p className="m-b-n">$name$：借款人姓名</p>
                            <p className="m-b-n">$date$：还款日期</p>
                            <p className="m-b-n">$amount$：预计还款金额</p>
                            <p className="m-b-n">$bankCard$：银行卡号(后四位)</p>
                            <p className="m-b-n">$bankName$：银行名称</p>
                            <p className="m-b-n">$overDueAmount$：历史未还款总金额</p>
                            <p className="m-b-n">$payOffAmount$：产品结清总金额</p>
                        </div>)}>
                            <Icon type="info-circle" className="icon-info" theme="filled"/>
                        </Tooltip>
                    </div>);
            },
            dataIndex: 'tmplContent',
            align: 'center',
            width: 300,
            render: (text, record, index) => {
                if(text && text.length >= 100) {
                    return (
                        <Tooltip placement="top" overlayClassName="overlay" overlayStyle={{maxWidth: '600px'}} title={<div>{text}</div>}>
                            <div className="list-long">{text}</div>
                        </Tooltip>
                    )
                } else {
                    return (
                        <div className="list-long">{text}</div>
                    )
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
            width: 100,
        }, {
            title: '操作',
            dataIndex: 'newBalance',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <div>
                        {messageManagementTemplateEdit && <Button className="m-r-xs" type="primary" size="small" ghost onClick={this.editTemplate.bind(this, record)}>修改</Button>}
                        {messageManagementTemplateDelete && <Popconfirm
                            title={`真的要删除【${record.tmplName}】吗？`}
                            okText="确定"
                            cancelText="取消"
                            placement="left"
                            onConfirm={this.deleteTemplate.bind(this, record)}
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
                    {messageManagementTemplateAdd && <Button className="m-r-xs" type="primary" onClick={this.openTemplateModal.bind(this)}>添加</Button>}
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

export default connect(mapStateToProps, mapDispatchToProps)(Channel);
