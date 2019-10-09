import React, {Component} from 'react';
import mapStatus from '@/assets/map/index';
import ListItem from '@/component/listItem/listItem';
import {getColumnStatus, toThousands} from '@/assets/js/common';
import TablePage from '@/component/tablePage/tablePage';
import {format} from '@/assets/js/common';

// 基础信息（个人和企业）
class DetailBaseInfo extends Component {
    render () {
        let itemList = null;
        const {borrowerType, userInfo, withholdStatus, bankList} = this.props;
        if(borrowerType === '1') {
            // 个人
            itemList = [{
                label: '姓名',
                key: 'bname',
                value: '-'
            }, {
                label: '性别',
                key: 'bsex',
                value: '-'
            }, {
                label: '学历',
                key: 'bdegrees',
                value: '-'
            }, {
                label: '证件类型',
                key: 'bidstyle',
                value: '-'
            }, {
                label: '证件号码',
                key: 'bidcard',
                value: '-'
            }, {
                label: '证件地址',
                key: 'zjaddress',
                value: '-'
            }, {
                label: '联系电话',
                key: 'bmobile',
                value: '-'
            }, {
                label: '联系电话2',
                key: 'bsparemobile',
                value: '-'
            }, {
                label: '通讯地址',
                key: 'baddress',
                value: '-'
            }, {
                label: '工作性质',
                key: 'bworknature',
                value: '-'
            }, {
                label: '信用卡使用额度',
                key: 'bxinyongkae',
                value: '-'
            }, {
                label: '婚姻状态',
                key: 'bmarital',
                value: '-'
            }, {
                label: '还款状态',
                key: 'repaymentstatus',
                value: '-'
            }, {
                label: '所属行业',
                key: 'bindustry',
                value: '-'
            }, {
                label: '月收入',
                key: 'bincome',
                value: '-'
            }, {
                label: '代扣状态',
                key: 'withholdstatus',
                value: '-'
            }];
        } else {
            // 机构
            itemList = [{
                label: '企业名称',
                key: 'bcomname',
                value: '-'
            }, {
                label: '证件号码',
                key: 'bbusinesslicense',
                value: '-'
            }, {
                label: '注册手机号',
                key: 'bmobile',
                value: '-'
            }, {
                label: '开户银行',
                key: 'bbank',
                value: '-'
            }, {
                label: '银行卡号',
                key: 'baccountnumber',
                value: '-'
            }, {
                label: '授信额度',
                key: 'bsurplusquota',
                value: '-'
            }, {
                label: '法人姓名',
                key: 'bname',
                value: '-'
            },  {
                label: '法人性别',
                key: 'bsex',
                value: '-'
            }, {
                label: '法人证件号',
                key: 'bidcard',
                value: '-'
            }, {
                label: '股东信息',
                key: 'bgudongxinxi',
                value: '-'
            }, {
                label: '法人信用信息',
                key: 'bfarenxinyong',
                value: '-'
            }, {
                label: '实缴资本',
                key: 'bshijiaoziben',
                value: '-'
            }, {
                label: '经营区域',
                key: 'bjingyingquyu',
                value: '-'
            }, {
                label: '注册资本',
                key: 'bzhuceziben',
                value: '-'
            }, {
                label: '注册地址',
                key: 'bzhuceaddress',
                value: '-'
            }, {
                label: '成立时间',
                key: 'bchenglitime',
                value: '-'
            }, {
                label: '办公地点',
                key: 'bbangongaddress',
                value: '-'
            }, {
                label: '资产总额',
                key: 'bzichanzonge',
                value: '-'
            }, {
                label: '负债总额',
                key: 'bfuzhaizonge',
                value: '-'
            }, {
                label: '年销售总额',
                key: 'bnianxiaoshoue',
                value: '-'
            }];
        }

        const columns = [{
            title: '是否代扣卡',
            dataIndex: 'isshouxuan',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.isshouxuan === 1 ? '是' : '否'}</span>
                );
            }
        }, {
            title: '银行开户行',
            dataIndex: 'bank',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{getColumnStatus(record.bank, bankList, 'name', 'code')}</span>
                );
            }
        }, {
            title: '银行卡号',
            dataIndex: 'khbankcode',
            align: 'center',
            width: 200
        }, {
            title: '预留手机号',
            dataIndex: 'yuliumobile',
            align: 'center',
            width: 100
        }, {
            title: '添加时间',
            dataIndex: 'createtime',
            align: 'center',
            width: 150,
            render: (text, record, index) => {
                return (
                    <span>{record.createtime && format(new Date(record.createtime), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }];

        Object.keys(userInfo).forEach(key => {
            itemList.forEach(item => {
                if(item.key === key) {
                    // 词典转换
                    if(key === 'bidstyle') {
                        item.value = getColumnStatus(userInfo[key], mapStatus.idDocumentType)
                    } else if (key === 'repaymentstatus') {
                        item.value = getColumnStatus(userInfo[key], mapStatus.repaymentStatus)
                    } else if (key === 'withholdstatus') {
                        item.value = getColumnStatus(userInfo[key], withholdStatus, 'name', 'code');
                        item.tipValue = userInfo.withholdRemark
                    }  else if (key === 'bank') {
                        item.value = getColumnStatus(userInfo[key], bankList, 'name', 'code')
                    } else if (key === 'bdegrees') {
                        item.value = getColumnStatus(userInfo[key], mapStatus.educationBackgroundType)
                    } else if (key === 'bindustry') {
                        item.value = getColumnStatus(userInfo[key], mapStatus.tradeType)
                    } else if (key === 'bworknature') {
                        item.value = getColumnStatus(userInfo[key], mapStatus.jobNatureType)
                    } else if (key === 'bmarital') {
                        item.value = getColumnStatus(userInfo[key], mapStatus.maritalType)
                    } else if (key === 'baddress') {
                        item.value = userInfo[key] && userInfo[key].replace(/\|/g, '')
                    } else if (key === 'bxinyongkae' || key === 'bincome' || key === 'bshijiaoziben' || key === 'bsurplusquota' || key === 'bzhuceziben'
                    || key === 'bzichanzonge' || key === 'bfuzhaizonge' || key === 'bnianxiaoshoue') {
                        item.value = toThousands(userInfo[key])
                    } else if (key === 'bchenglitime') {
                        if(userInfo[key]) {
                            item.value = format(new Date(userInfo[key]), 'yyyy-MM-dd')
                        } else {
                            item.value = '-'
                        }
                    } else {
                        item.value = userInfo[key] || '-';
                    }
                }
                if (item.key === 'bsex') {
                    // 企业注册法人性别前端判断
                    if(userInfo['bidcard']) {
                        const cardNumber = (userInfo['bidcard'].split('')[userInfo['bidcard'].split('').length - 2]) % 2;
                        if(cardNumber > 0) {
                            // 奇数
                            item.value = '男'
                        } else {
                            item.value = '女'
                        }

                    }
                }
            })
        });
        return (
            <React.Fragment>
                <div>
                {itemList.map((item, index) => {
                    return (
                        item.tipValue ?
                            <ListItem key={index} row={item} itemLabel={item.label} itemValue={item.value}
                                      tipValue={item.tipValue}
                                      fontColor={{color: '#cf1322'}}
                            />
                            :
                            <ListItem key={index} row={item} itemLabel={item.label} itemValue={item.value}/>
                    );
                })}
                </div>
                {borrowerType === '1' && <div>
                    <TablePage
                        rowKey="id"
                        data={userInfo.bankCardList}
                        columns={columns}
                        pageOtherHeight="190"
                    />
                </div>}
            </React.Fragment>
        );
    }
}

export default DetailBaseInfo;

