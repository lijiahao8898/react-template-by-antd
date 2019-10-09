import React, {Component} from 'react';
import {Modal, Button} from 'antd';
import ImagesPreview from './imagesPreview'

// 还款凭证
class repaymentVoucherModal extends Component {
    // constructor (props) {
    //     super(props);
    // }

    modalCancel () {
        this.props.onCancel();
    }

    render () {
        const {
            openModal,
            currentRepaymentRecord,
            RepaymentSchedsFiles
        } = this.props;

        const titleStyle = {
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px'
        };
        // console.log(RepaymentSchedsFiles);
        return (
            <Modal
                title="还款凭证"
                maskClosable={false}
                visible={openModal}
                onCancel={this.modalCancel.bind(this)}
                width={800}
                footer={[
                    <Button key="back" onClick={this.modalCancel.bind(this)}>关闭</Button>
                ]}>
                <div className="voucher-title" style={titleStyle}>还款期次&nbsp;{currentRepaymentRecord.repaymentPeriod}</div>
                <div style={{
                    maxHeight: '540px',
                    overflowY: 'auto'
                }}>
                    <ImagesPreview RepaymentSchedsFiles={RepaymentSchedsFiles}></ImagesPreview>
                </div>
            </Modal>
        );
    }
}

export default repaymentVoucherModal;
