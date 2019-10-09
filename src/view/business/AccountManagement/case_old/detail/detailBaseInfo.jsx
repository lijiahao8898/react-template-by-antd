import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import mapStatus from '@/assets/map/index';
import ListItem from '@/component/listItem/listItem';
import {getColumnStatus, toThousands, format} from '@/assets/js/common';

const mapStateToProps = (state, ownProps) => {
    return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return bindActionCreators(action, dispatch);
};

class DetailBaseInfo extends Component {
    constructor (props) {
        super(props);
        this.id = props.match.params.id;
    }
    render () {
        const {productInfo, productType} = this.props;
        const itemList = [{
            label: '产品名称',
            key: 'proname',
            value: '-'
        }, {
            label: '产品别名',
            key: 'probieming',
            value: '-'
        }, {
            label: '资产编号',
            key: 'assetid',
            value: '-'
        }, {
            label: '合同主编号',
            key: 'procode',
            value: '-'
        }, {
            label: '产品类型',
            key: 'protype',
            value: '-'
        }, {
            label: '产品状态',
            key: 'prostatus',
            value: '-'
        }, {
            label: '募集规模',
            key: 'mjguimo',
            value: '-'
        }, {
            label: '产品期限',
            key: 'qixian',
            value: '-'
        }, {
            label: '计提风险保证金',
            key: 'jtbaozhengjin',
            value: '-'
        }, {
            label: '代偿时间',
            key: 'daichangdate',
            value: '-'
        }, {
            label: '代偿方',
            key: 'pfzhutiname',
            value: '-'
        }, {
            label: '赔付计划',
            key: 'pfjihua',
            value: '-'
        }, {
            label: '赔付顺序',
            key: 'pfshunxu',
            value: '-'
        }];
        Object.keys(productInfo).forEach(key => {
            itemList.forEach(item => {
                if(item.key === key) {
                    // 词典转换
                    if(key === 'mjguimo') {
                        item.value = toThousands(productInfo[key] * 10000)
                    } else if (key === 'jtbaozhengjin' || key === 'pfjihua') {
                        item.value = getColumnStatus(productInfo[key], mapStatus.commonType)
                    } else if (key === 'daichangdate') {
                        if(productInfo[key]) {
                            item.value = format(new Date(productInfo[key]), 'yyyy-MM-dd')
                        } else {
                            item.value = '-';
                        }
                    } else if (key === 'pfshunxu') {
                        item.value = getColumnStatus(productInfo[key], mapStatus.compensate)
                    } else if (key === 'prostatus') {
                        item.value = getColumnStatus(productInfo[key], mapStatus.productStatus)
                    } else if (key === 'protype') {
                        item.value = getColumnStatus(productInfo[key], productType, 'name', 'code')
                    } else {
                        item.value = productInfo[key] || '-';
                    }
                }
            })
        });
        const { jumpUrl } = this.props.initListBtnCfg;
        return (
            <React.Fragment>
                {itemList.map((item, index) => {
                    return (
                        <ListItem key={index} row={item} itemLabel={item.label} itemValue={item.value}>
                            {item.value && item.key === 'assetid' && productInfo['packageid'] ?
                                <a target="_blank"
                                   href={`http://${jumpUrl}/Default.aspx?tourl=/GodEyeManage/RongZiPackageDetail.aspx?Id=${productInfo['packageid']}`}>{item.value}</a>
                                : <span>{item.value}</span>}
                        </ListItem>
                    );
                })}
            </React.Fragment>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(DetailBaseInfo));

