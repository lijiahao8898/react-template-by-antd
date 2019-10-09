import React, {Component} from 'react';
import mapStatus from '@/assets/map/index';
import ListItem from '@/component/listItem/listItem';
// tool
import {autobind} from 'core-decorators';
import {getColumnStatus, toThousands} from '@/assets/js/common';
import {format} from '@/assets/js/common';
import Api from '@/api/index';
//  style
import './detail.scss';

// 基础信息（个人和企业）
class BaseInfo extends Component {
    constructor (props) {
        super(props);
        this.state = {
            caseInfo: {
                caseAmount: null,
                caseNum: null,
                debtNum: null
            }
        }
    }

    @autobind
    async getCustomerCaseInfo () {
        const data = await Api('get', 'getCustomerCaseInfo', {
            borrowerId: this.props.borrowerId
        });
        if(data.success) {
            this.setState({
                caseInfo: Object.assign({}, this.state.caseInfo, data.datas.content)
            })
        }
    }

    render () {
        let itemList = null;
        /*age: 1058622469
        borrowerIdNo: "330902198602241018"
        borrowerName: "包奕晖"
        idAddress: null
        maritalStatus: 0
        sex: "男"*/
        const {borrowerType, userInfo, withholdStatus, bankList} = this.props;
        const {caseInfo} = this.state;
        if (borrowerType === '1') {
            // 个人
            itemList = [{
                label: '姓名',
                key: 'borrowerName',
                value: '-'
            }, {
                label: '性别',
                key: 'sex',
                value: '-'
            }, {
                label: '年龄',
                key: 'age',
                value: '-'
            }, {
                label: '身份证',
                key: 'borrowerIdNo',
                value: '-'
            }, {
                label: '证件地址',
                key: 'idAddress',
                value: '-'
            }, {
                label: '婚姻状态',
                key: 'maritalStatus',
                value: '-',
                option: mapStatus.maritalType
            }];
        } else {
            // 机构
            itemList = [{
                label: '企业名称',
                key: 'borrowerName',
                value: '-'
            }, {
                label: '成立时间',
                key: 'setUpDate',
                value: '-'
            }, {
                label: '办公地点',
                key: 'workAddress',
                value: '-'
            }, {
                label: '证件类型',
                key: 'zjlx',
                value: '营业执照'
            }, {
                label: '证件号码',
                key: 'entCode',
                value: '-'
            }, {
                label: '证件地址',
                key: 'idAddress',
                value: '-'
            }, {
                label: '法人代表姓名',
                key: 'legalName',
                value: '-'
            }, {
                label: '法人代表性别',
                key: 'legalSex',
                value: '-'
            }, {
                label: '法人代表证件号',
                key: 'legalIdNo',
                value: '-'
            },];
        }

        Object.keys(userInfo).forEach(key => {
            itemList.forEach(item => {
                if (item.key === key) {
                    // 词典转换
                    if (item.option) {
                        console.log(userInfo[key]);
                        item.value = getColumnStatus(userInfo[key], item.option)
                    } else if (item.remoteOption) {
                        item.value = getColumnStatus(userInfo[key], item.option, 'name', 'code')
                    } else if (key === 'zjlx') {
                        item.value = '营业执照'
                    } else {
                        item.value = userInfo[key] || '-';
                    }
                }
                // if (item.key === 'bsex') {
                //     // 企业注册法人性别前端判断
                //     if (userInfo['bidcard']) {
                //         const cardNumber = (userInfo['bidcard'].split('')[userInfo['bidcard'].split('').length - 2]) % 2;
                //         if (cardNumber > 0) {
                //             // 奇数
                //             item.value = '男';
                //         } else {
                //             item.value = '女';
                //         }
                //
                //     }
                // }
            });
        });
        return (
            <div>
                <div>
                    {itemList.map((item, index) => {
                        return (
                            item.tipValue ?
                                <ListItem key={index} row={item} itemLabel={item.label} itemValue={item.value} tipValue={item.tipValue}
                                          fontColor={{color: '#cf1322'}}/>
                                :
                                <ListItem key={index} row={item} itemLabel={item.label} itemValue={item.value}/>
                        );
                    })}
                </div>
                <div className='case'>
                    <div className='case-item'>
                        <label onClick={this.getCustomerCaseInfo}><a>查看债权数：</a></label>
                        <span>{caseInfo.debtNum ? caseInfo.debtNum : '-'}</span>
                    </div>
                    <div className='case-item'>
                        <label onClick={this.getCustomerCaseInfo}><a>查看案件数：</a></label>
                        <span>{caseInfo.caseNum ? caseInfo.caseNum : '-'}</span>
                    </div>
                    <div className='case-item'>
                        <label onClick={this.getCustomerCaseInfo}><a>查看案件额：</a></label>
                        <span>{caseInfo.caseAmount ? toThousands(caseInfo.caseAmount) : '-'}</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default BaseInfo;

