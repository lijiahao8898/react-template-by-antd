import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import action from '@/store/action';
import {withRouter} from 'react-router-dom';
import {Button, message} from 'antd';
import Api from '@/api/index';
import Cookies from 'js-cookie';
// tool
import qs from 'query-string';
import {format, listDataProcessing} from '@/assets/js/common';
import {initialPage} from '@/assets/js/config';
// component
import TablePage from '@/component/tablePage/tablePage';
import TrackRecordModal from '@/component/trackRecordModal/trackRecordModalNew';
import JycCard from '@/component/jycCard/jycCard';

function getBase64 (file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

@connect(
    state => ({state}),
    dispatch => ({action: bindActionCreators(action, dispatch)})
)
class TrackList extends Component {

    constructor (props) {
        super(props);
        this.state = {
            openTrackRecordModal: false,
            tableLoading: false,
            pagination: {
                pageNum: 1,
                pageSize: initialPage.pageSize,
                pageTotal: 0
            },
            trackList: [],
            modalFileList: [],
            modalPreviewList: [],
            operateType: 1,
            record: {},
            caseTrackTypes: []
        };
        if (this.props.history.location.search) {
            const search = qs.parse(this.props.history.location.search);
            this.debtName = search.dn;
            this.id = search.id;            // caseId
            this.borrowerId = search.bid || props.match.params.id;
            this.borrowerName = search.bn;
            this.caseNumber = search.cn;
            this.locationSearchParams = {
                debtName: this.debtName,
                caseId: this.id,
                borrowerId: this.borrowerId,
                borrowerName: this.borrowerName,
                caseNumber: this.caseNumber
            };
            console.log(this.locationSearchParams);
        }
    }

    componentDidMount () {
        this.getList();
        this.getTrackerType();
    }

    async getList () {
        const pager = {...this.state.pagination};
        this.setState({tableLoading: true});
        const params = Object.assign({}, this.state.pagination);
        delete params.pageTotal;
        const data = await Api('get', 'caseTrackList', {
            caseId: this.id,
            borrowerId: this.borrowerId,
            ...params
        });
        this.setState({tableLoading: false});
        if (data.success) {
            pager.pageTotal = data.datas.total;
            this.setState({
                trackList: [...data.datas.content],
                pagination: pager,
            });
        }
    }

    async getTrackerType () {
        const data = await Api('GET', 'getTrackerType', {
            mobile: Cookies.get('m')
        });
        if(data.success) {
            this.setState({
                caseTrackTypes: data.datas.content || []
            })
        }
    }

    async openTrackRecordModalFunc (type, record) {
        if(type === 2) {
            const data = await Api('get', 'getCaseTrackDetail', {
                trackId: record.id
            });
            if(data.success) {
                this.setState(({
                    openTrackRecordModal: true,
                    operateType: Number(type),
                    record: data.datas.content
                }));
                let fileArr = data.datas.content.trackEnclosureList;
                let previewArr = [...this.state.modalPreviewList];
                fileArr.forEach(item => {
                    // getBase64(new Blob(item)).then((preview) => {
                        previewArr.push({
                            preview: item.enclosureUrl,
                            name: item.enclosureTitle
                        });
                        let arr = [...this.state.modalFileList];
                        arr = arr.concat(fileArr);
                        this.setState({
                            modalFileList: arr,
                            modalPreviewList: [...previewArr]
                        });
                    // }).catch((e) => {
                        // console.log(e);
                    // });
                });
            } else {
                message.error('获取详情失败')
            }
        } else {
            this.setState(({
                openTrackRecordModal: true,
                operateType: Number(type),
            }))
        }
    }

    submit () {
        this.getList();
        this.cancel();
    }

    cancel () {
        this.setState({
            openTrackRecordModal: false,
            modalPreviewList: [],
            modalFileList: []
        });
    }

    // 翻页
    changePageSize (page, pageSize) {
        let pager = {...this.state.pagination};
        pager.pageNum = page;

        this.setState({
            pagination: pager
        }, () => {
            this.getList();
        });
    }

    // 改变展示的页数
    changeShowPageSize (current, pageSize) {
        let pager = {...this.state.pagination};
        pager.pageSize = pageSize;
        pager.pageNum = 1;

        this.setState({
            pagination: pager
        }, () => {
            this.getList();
        });
    }

    deletePreviewImage = (index) => {
        let {modalFileList, modalPreviewList} = this.state;

        modalFileList.splice(index, 1);
        modalPreviewList.splice(index, 1);

        this.setState({
            fileList: [...modalFileList],
            modalPreviewList: [...modalPreviewList]
        });
    };

    beforeUpload = (file, fileList) => {
        let fileArr = [file];
        let previewArr = [...this.state.modalPreviewList];
        getBase64(file).then((preview) => {
            previewArr.push({
                preview: preview,
                name: file.name
            });
            let arr = [...this.state.modalFileList];
            arr = arr.concat(fileArr);
            this.setState({
                modalFileList: arr,
                modalPreviewList: [...previewArr]
            });
        }).catch((e) => {
            console.log(e);
        });
    };

    render () {
        const {trackListAddCode, appOverdueAssetsDetail, trackListDetailCode} = this.props.state.menuList.powerList;
        const {list} = listDataProcessing(this.state.trackList);
        const {openTrackRecordModal, pagination, tableLoading, record, modalFileList, modalPreviewList, caseTrackTypes} = this.state;

        const columns = [{
            title: '序号',
            align: 'center',
            dataIndex: 'index',
            width: 50,
            render: (text, record, index) => `${index + 1}`,
        }, {
            title: '时间',
            dataIndex: 'createdOn',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.createdOn && format(new Date(record.createdOn), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '类型',
            dataIndex: 'typeName',
            align: 'center',
            width: 100
        }, {
            title: '备注',
            dataIndex: 'memo',
            align: 'center',
            width: 100
        }, {
            title: '结果',
            dataIndex: 'result',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{text ? text : '/'}</span>
                );
            }
        }, {
            title: '操作员',
            dataIndex: 'createdBy',
            align: 'center',
            width: 100
        }, {
            title: '下次催收时间',
            dataIndex: 'nextTrackTime',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                return (
                    <span>{record.nextTrackTime && format(new Date(record.nextTrackTime), 'yyyy-MM-dd hh:mm:ss')}</span>
                );
            }
        }, {
            title: '操作',
            dataIndex: 'productName',
            align: 'center',
            width: 100,
            render: (text, record, index) => {
                if (trackListDetailCode) {
                    return (
                        <Button type='primary' size='small' ghost onClick={() => this.openTrackRecordModalFunc(2, record)}>查看详情</Button>
                    );
                } else {
                    return (<span>-</span>);
                }
            }
        },];
        return (
            <React.Fragment>
                <JycCard>
                    <div className="m-b-xs">
                        {trackListAddCode && <Button className="m-r-xs" type="primary" onClick={() => this.openTrackRecordModalFunc(1)}>添加</Button>}
                    </div>
                    <TablePage
                        rowKey="index"
                        data={list}
                        columns={columns}
                        loading={tableLoading}
                        pageOtherHeight="190"
                        pagination={{
                            current: pagination.pageNum,
                            pageSize: pagination.pageSize,
                            total: pagination.pageTotal,
                            onShowSizeChange: (current, pageSize) => {
                                return this.changeShowPageSize(current, pageSize);
                            },
                            onChange: (page, pageSize) => {
                                return this.changePageSize(page, pageSize);
                            }
                        }}
                    />
                </JycCard>
                <TrackRecordModal
                    openModal={openTrackRecordModal}
                    record={record}
                    modalFileList={modalFileList}
                    modalPreviewList={modalPreviewList}
                    onOk={this.submit.bind(this)}
                    onCancel={this.cancel.bind(this)}
                    operateType={this.state.operateType}
                    deletePreviewImage={(i) => this.deletePreviewImage(i)}
                    beforeUpload={(file, fileList) => this.beforeUpload(file, fileList)}
                    currentCaseTrackTypes={caseTrackTypes}
                    locationSearchParams={this.locationSearchParams}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(TrackList);
