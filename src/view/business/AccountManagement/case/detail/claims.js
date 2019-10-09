import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';

import ListItem from '@/component/listItem/listItem';
// tool
import {autobind} from 'core-decorators';
import mapStatus from '@/assets/map/index';
import {getColumnStatus, toThousands, format} from '@/assets/js/common';
import Api from '@/api/index';
import qs from 'query-string';

@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class Case extends Component {
    constructor (props) {
        super(props);
        this.state = {
            info: {
                caseCount: '',
                amount: ''
            }
        };
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.debtId = search.debtId;
        }
    }

    @autobind
    async getInfo () {
        const data = await Api('GET', 'getDebtAboutCases', {
            id: this.debtId
        });
        if(data.success) {
            this.setState({
                info: Object.assign({}, this.state.info, data.datas)
            })
        }
    }

    render () {
        const {info} = this.state;
        const {debtDetailInfo} = this.props;
        const itemList = [{
            label: '债权名称',
            key: 'debtName',
            value: '-'
        }, {
            label: '利率（%）',
            key: 'rate',
            value: '-'
        }, {
            label: '委催方',
            key: 'channelName',
            value: '-'
        }, {
            label: '还款方式',
            key: 'paymentTypeStr',
            value: '-'
        }, {
            label: '还款期次',
            key: 'periods',
            value: '-'
        }, {
            label: '放款金额',
            key: 'amount',
            type: 'money',
            value: '-'
        }, {
            label: '放款日期',
            key: 'dealingDate',
            type: 'date',
            value: '-'
        }, {
            label: '到期日期',
            key: 'deadline',
            type: 'date',
            value: '-'
        }];
        Object.keys(debtDetailInfo).forEach(key => {
            itemList.forEach(item => {
                if (item.key === key) {
                    if (item.option) {
                        // 词典转换
                        item.value = getColumnStatus(debtDetailInfo[key], item.option);
                    } else if (item.remoteOption) {
                        // 远程字典
                        item.value = getColumnStatus(debtDetailInfo[key], item.remoteOption, 'name', 'code');
                    } else if (item.type && item.type === 'date') {
                        // 时间
                        if (debtDetailInfo[key]) {
                            item.value = format(new Date(debtDetailInfo[key]), 'yyyy-MM-dd');
                        } else {
                            item.valie = '-';
                        }
                    } else if (item.type && item.type === 'money') {
                        // 金额
                        item.value = toThousands(debtDetailInfo[key]);
                    } else {
                        item.value = debtDetailInfo[key] || '-';
                    }
                }
            });
        });
        const {jumpUrl} = this.props.state.initListBtnCfg;
        return (
            <React.Fragment>
                {itemList.map((item, index) => {
                    return (
                        <ListItem key={index} row={item} itemLabel={item.label} itemValue={item.value}>
                            {item.value && item.key === 'assetid' && debtDetailInfo['packageid'] ?
                                <a target="_blank"
                                   href={`http://${jumpUrl}/Default.aspx?tourl=/GodEyeManage/RongZiPackageDetail.aspx?Id=${debtDetailInfo['packageid']}`}>{item.value}</a>
                                : <span>{item.value}</span>}
                        </ListItem>
                    );
                })}
                <div className='case'>
                    <div className='case-item'>
                        <label onClick={this.getInfo}><a>查看案件数：</a></label>
                        <span>{info.caseCount ? info.caseCount : '-'}</span>
                    </div>
                    <div className='case-item'>
                        <label onClick={this.getInfo}><a>查看案件额：</a></label>
                        <span>{info.amount ? toThousands(info.amount) : '-'}</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(Case);

