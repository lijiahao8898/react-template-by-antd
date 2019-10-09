import React, {memo} from 'react';
import {Card} from 'antd';

const JycCard = (props) => {
    const bodyStyle = {
        padding: '5px'
    };
    return (
        <Card bodyStyle={bodyStyle}>
            {props.children}
        </Card>
    )
};

export default memo(JycCard)