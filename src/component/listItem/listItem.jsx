import React, {memo} from 'react';
import {Tooltip} from 'antd';
import './listItem.scss'

// 条目组件
const ListItem = (props) => {
    const {
        itemLabel,
        itemValue,
        background,
        theme,
        tipValue,
        fontColor
    } = props;
    return (
        <div className={`list-item ${theme ? theme : ''}`} style={{background}}>
            <label className="label">{itemLabel}：</label>
            <Tooltip placement="topLeft" title={tipValue ? tipValue : itemValue}>
                <span style={fontColor}>{(props.children ? props.children : (itemValue || itemValue === 0 ? itemValue : '-')) }</span>
            </Tooltip>
        </div>
    )
};

export default memo(ListItem)