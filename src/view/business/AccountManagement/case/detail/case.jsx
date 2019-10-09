import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import mapStatus from '@/assets/map/index';
import ListItem from '@/component/listItem/listItem';
import {getColumnStatus, toThousands, format} from '@/assets/js/common';

@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class Case extends Component {
    constructor (props) {
        super(props);
        this.id = props.match.params.id;
    }

    render () {
        const {caseDetailInfo} = this.props;
        const {overdueStatus} = this.props.state.statusItemList;
        const itemList = [{
            label: '案件编号',
            key: 'caseNum',
            value: '-'
        }, {
            label: '委案状态',
            key: 'entrustStatus',
            option: mapStatus.entrustStatus,
            value: '-'
        }, {
            label: '委案时间',
            key: 'createdon',
            type: 'date',
            value: '-'
        }, {
            label: '结案时间',
            key: 'finishDate',
            type: 'date',
            value: '-'
        }, {
            label: '应还款日期',
            key: 'expectedRepaymentDate',
            type: 'date',
            value: '-'
        }, {
            label: '逾期状态',
            key: 'overdueStatus',
            remoteOption: overdueStatus,
            value: '-'
        }, {
            label: '实际还款日',
            key: 'realRepaymentDate',
            type: 'date',
            value: '-'
        }, {
            label: '还款状态',
            key: 'repymtStatusStr',
            value: '-'
        }, {
            label: '应还本金',
            key: 'investorPrincipal',
            type: 'money',
            value: '-'
        }, {
            label: '应还息费',
            key: 'investorInterest',
            type: 'money',
            value: '-'
        }, {
            label: '应还保证金',
            key: 'repymtBond',
            type: 'money',
            value: '-'
        }, {
            label: '应付罚息',
            key: 'penaltyAmount',
            type: 'money',
            value: '-'
        }, {
            label: '已还款金额',
            key: 'repymtAmount',
            type: 'money',
            value: '-'
        }, {
            label: '催服状态',
            key: 'trackStatusStr',
            value: '-'
        }, {
            label: '还款期次',
            key: 'repaymentPeriodStr',
            value: '-'
        }, {
            label: '备注',
            key: 'remark',
            value: '-'
        }];
        Object.keys(caseDetailInfo).forEach(key => {
            itemList.forEach(item => {
                if (item.key === key) {
                    if (item.option) {
                        // 词典转换
                        item.value = getColumnStatus(caseDetailInfo[key], item.option);
                    } else if (item.remoteOption) {
                        // 远程字典
                        item.value = getColumnStatus(caseDetailInfo[key], item.remoteOption, 'name', 'code');
                    } else if (item.type && item.type === 'date') {
                        // 时间
                        if (caseDetailInfo[key]) {
                            item.value = format(new Date(caseDetailInfo[key]), 'yyyy-MM-dd hh:mm:ss');
                        } else {
                            item.valie = '-';
                        }
                    } else if (item.type && item.type === 'money') {
                        // 金额
                        item.value = toThousands(caseDetailInfo[key]);
                    } else {
                        item.value = caseDetailInfo[key] || '-';
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
                            {item.value && item.key === 'assetid' && caseDetailInfo['packageid'] ?
                                <a target="_blank"
                                   href={`http://${jumpUrl}/Default.aspx?tourl=/GodEyeManage/RongZiPackageDetail.aspx?Id=${caseDetailInfo['packageid']}`}>{item.value}</a>
                                : <span>{item.value}</span>}
                        </ListItem>
                    );
                })}
            </React.Fragment>
        );
    }
}

export default withRouter(Case);

