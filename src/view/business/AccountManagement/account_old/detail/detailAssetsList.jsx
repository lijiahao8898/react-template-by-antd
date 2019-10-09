import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import TablePage from '@/component/tablePage/tablePage';
import baseConfig from '@/assets/js/config';
import Api from '@/api/index';
import {format, getColumnStatus, accMul, toThousands} from '@/assets/js/common';

// 资产列表
class DetailAssetsList extends Component {
    constructor (props) {
        super(props);
        this.state = {
            assetsList: [],
            pagination: {
                pageSize: baseConfig.initialPage.pageSize,
                pageNum: 1,
                total: 0
            },
        };
    }

    componentDidMount () {
        this.getAssetsList();
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
        if (Number(nextProps.tabType) === 4 && nextProps.tabType !== this.props.tabType) {
            this.setState({
                pagination: {
                    pageSize: baseConfig.initialPage.pageSize,
                    pageNum: 1,
                    total: 0
                },
            }, () => {
                this.getAssetsList();
            });
        }
    }

    async getAssetsList () {
        const pager = {...this.state.pagination};
        const params = {
            pageSize: pager.pageSize,
            pageNum: pager.pageNum
        };
        const data = await Api('get', {
            serviceUrl: `borrowers/${this.props.borrowerId}/assets`
        }, {
            borrowerId: this.props.borrowerId,
            ...params
        });
        if (data.success) {
            pager.total = data.datas.total;
            this.setState({
                assetsList: data.datas.content,
                pagination: pager,
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
            this.getAssetsList();
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
            this.getAssetsList();
        });
    }

    updateListData (list) {
        list.forEach((item, index) => {
            item.index = index
        });
        return list;
    }

    render () {
        const {assetsList, pagination} = this.state;
        const renderList = this.updateListData(assetsList);
        const {repaymentStatus, repaymentMethod, productType, jumpUrl, powerList} = this.props;
        const {appOverdueAssetsDetail} = powerList;
        const columns = [{
            title: '资产编号',
            dataIndex: 'assetid',
            align: 'center',
            width: 200,
            render: (text, record, index) => {
                return  <a target="_blank" href={`http://${jumpUrl}/Default.aspx?tourl=/GodEyeManage/RongZiPackageDetail.aspx?Id=${record.id}`}>{text}</a>
            }
        }, {
            title: '产品名称',
            dataIndex: 'proname',
            align: 'center',
            width: 120,
            render: (text, record, index) => {
                if(appOverdueAssetsDetail) {
                    return (
                        <Link to={`/app/case/detail/${record.proid}`} target="_blank">{text}</Link>
                    );
                } else {
                    return (<span>{text}</span>)
                }
            }

        }, {
            title: '还款状态',
            dataIndex: 'prostatus',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatus(record.prostatus, repaymentStatus, 'name', 'code')}</span>
                );
            }
        }, {
            title: '类型',
            dataIndex: 'protype',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatus(record.protype, productType, 'name', 'code')}</span>
                );
            }
        }, {
            title: '融资金额',
            dataIndex: 'mjguimo',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{toThousands(accMul(record.mjguimo, 10000))}</span>
                );
            }
        }, {
            title: '起始日期',
            dataIndex: 'qishidate',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.qishidate && format(new Date(record.qishidate), 'yyyy-MM-dd')}</span>
                );
            }
        }, {
            title: '截止日期',
            dataIndex: 'jiezhidate',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.jiezhidate && format(new Date(record.jiezhidate), 'yyyy-MM-dd')}</span>
                );
            }
        }, {
            title: '分配方式',
            dataIndex: 'astyle',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatus(record.astyle, repaymentMethod, 'name', 'code')}</span>
                );
            }
        }];
        return (
            <div>
                <TablePage
                    rowKey="index"
                    data={renderList}
                    columns={columns}
                    pageOtherHeight="190"
                    pagination={{
                        current: pagination.pageNum,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        onShowSizeChange: (current, pageSize) => {
                            return this.changeShowPageSize(current, pageSize);
                        },
                        onChange: (page, pageSize) => {
                            return this.changePageSize(page, pageSize);
                        }
                    }}
                />
            </div>
        );
    }
}

export default DetailAssetsList;
