import React, {Component} from 'react';
import {Table, Pagination} from 'antd';

/**
 * 表格和翻页合并组件
 */
class TablePage extends Component {
    render () {
        const searchHeight = document.getElementById('search');
        // 搜索框的高度
        const searchOffsetHeight = searchHeight && searchHeight.offsetHeight;
        const props = this.props;
        const pagination = props.pagination;
        const wWith = window.innerWidth;
        const wHeight = window.innerHeight;
        // 计算columns的宽度
        let columnsWidth = 0;
        if (props.columns) {
            props.columns.forEach(item => {
                // >= 1300 平分
                if (!item.width && wWith >= 1300) {
                    item.width = 120;
                }
                columnsWidth += (item.width || 120);
            });
        }
        const width = (wWith - 280) < (columnsWidth + 50) ? (columnsWidth + 50) : (wWith - 280);
        // pageOtherHeight：部分页面的特殊高度
        const height = props.height ? props.height : (props.pageOtherHeight ? (wHeight - props.pageOtherHeight - searchOffsetHeight - 10) : (wHeight - 138 - searchOffsetHeight - 10));
        let scrollObj = {};
        // 宽度是否滚动
        if (props.columns && props.columns.length > 5) {
            scrollObj.x = width;
        }
        // 高度是否滚动
        if (props.data && props.data.length > 10) {
            scrollObj.y = height;
        }
        const attributeObj = {
            size: 'default',
            bordered: true,
            rowKey: props.rowKey,
            scroll: scrollObj,
            dataSource: props.data,
            columns: props.columns,
            loading: props.loading,
            rowSelection: props.rowSelection,
            expandedRowRender: props.expandedRowRender,
            style: {
                tableLayout: 'fixed'
            },
            title: () => {
                return (
                    <div style={{overflow: 'hidden'}}>
                        <div style={{float: 'left'}}>{props.footer ? props.footer : null}</div>
                    </div>
                );
            }
        };
        if (wWith > 1280) {
            // 目前的业务数据条数展示比较少所以在1200的宽度下，无需滚动
            delete attributeObj.scroll.x;
        }
        // 删除无用的属性
        Object.keys(attributeObj).forEach(key => {
            if (!attributeObj[key]) {
                delete attributeObj[key];
            }
        });
        if (!props.footer) {
            delete attributeObj.title;
        }
        return (
            <div>
                <Table {...attributeObj} pagination={false}/>
                <div className="m-t-xs tr">
                    {pagination &&
                    <Pagination size="small"
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                showSizeChanger
                                pageSizeOptions={props.pageSizeOptions || ['10', '20', '50', '100', '200', '500']}
                                showTotal={(total, range) => `当前共${total}条`}
                                onShowSizeChange={(current, size) => {
                                    return pagination.onShowSizeChange(current, size);
                                }}
                                onChange={(page, pageSize) => {
                                    return pagination.onChange(page, pageSize);
                                }}
                    />}
                </div>
            </div>
        );
    }
}

export default TablePage;
