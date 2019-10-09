import React from 'react';
import {Input} from 'antd'

class JycInput extends React.Component{
    render () {
        return <Input {...this.props} autoComplete='off'/>

    }
}

export default JycInput
