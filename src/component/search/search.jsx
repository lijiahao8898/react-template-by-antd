import React, {Component} from 'react';
import {Card, Input, Select, Form, Button, DatePicker, message} from 'antd';
import './search.scss';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;
const {RangePicker} = DatePicker;
const nameSpace = '_';
const textRangeStart = '_textrangeStart';
const textRangeEnd = '_textrangeEnd';

function disabledDateFunc(current) {
    // Can not select days before today
    return current && current > moment().endOf('day');
}

class Search extends Component {
    constructor (props) {
        super(props);
        this.state = {
            searchParams: {},
        };
    }

    componentDidMount () {
    }

    search () {
        const {search} = this.props;
        this.props.form.validateFields(async (err, value) => {
            if (!err) {
                let newValue = {};
                let optionKey = null;
                try {
                    Object.keys(value).forEach(key => {
                        if (typeof value[key] === 'object' && key.indexOf('daterange') !== -1) {
                            // 时间段选择
                            if (Object.prototype.toString.call(value[key]) === '[object Array]') {
                                // 数组
                                const searchKey = key.split(nameSpace)[0];
                                for(let i = 0; i < search.length; i ++) {
                                    if(searchKey === search[i].key) {
                                        // 将keyList赋值
                                        newValue[search[i].keyList[0]] = value[key][0] && value[key][0].format('YYYY-MM-DD');
                                        newValue[search[i].keyList[1]] = value[key][1] && value[key][1].format('YYYY-MM-DD');
                                    }
                                }
                            }
                        } else if (typeof value[key] === 'string' && key.indexOf('textrange') !== -1) {
                            if (!this.handleTextRange(key)) {
                                throw new Error('验证未通过');
                            }
                            if (key.indexOf(textRangeStart) !== -1) {
                                // 关联文本
                                const searchKey = key.split(nameSpace)[0];
                                for(let i = 0; i < search.length; i ++) {
                                    if(searchKey === search[i].key) {
                                        // 将keyList赋值
                                        newValue[search[i].keyList[0]] = value[key];
                                    }
                                }
                            } else if (key.indexOf(textRangeEnd) !== -1) {
                                // 关联文本
                                const searchKey = key.split(nameSpace)[0];
                                for(let i = 0; i < search.length; i ++) {
                                    if(searchKey === search[i].key) {
                                        // 将keyList赋值
                                        newValue[search[i].keyList[1]] = value[key];
                                    }
                                }
                            }
                        } else if (key.indexOf('option_') !== -1) {
                            // 文本联动 - key
                            optionKey = value[key];
                        } else if (key.indexOf('optionValue_') !== -1) {
                            // 文本联动 - value
                            if(!optionKey && value[key]) {
                                // 有value没有key,我怎么知道哪个，给你报错
                                message.info(`关键词未选择`);
                                throw new Error('验证未通过');
                            }
                            if(optionKey) {
                                // 有key
                                const item = this.getCurrentSearchItem(key.split(nameSpace)[1]);
                                item.keyList.forEach(i => {
                                    if(i.key === optionKey) {
                                        if(value[key] && value[key].length > i.maxLength) {
                                            message.info(`${item.label}${i.label}输入超过限制，最长支持${i.maxLength}`);
                                            throw new Error('验证未通过');
                                        }
                                    }
                                })
                            }
                            optionKey && (newValue[optionKey] = value[key]);
                            optionKey = null;
                        } else {
                            newValue[key] = value[key];
                        }
                    });
                    let addArr = [];
                    search.forEach(item => {
                        if(item.add) {
                            addArr.push(item.key);
                        }
                    });
                    if(addArr.length > 0) {
                        Object.keys(newValue).forEach(key => {
                            addArr.forEach(addArrKey => {
                                if(addArrKey === key && newValue[addArrKey]) {
                                    newValue[key] = this.getValueTotal(newValue[addArrKey])
                                } else if(Object.prototype.toString.call(newValue[key]) === '[object Array]') {
                                    newValue[key] = newValue[key].toString();
                                }
                                if(!newValue[key]) {
                                    delete newValue[key]
                                }
                            });
                        });
                    } else {
                        Object.keys(newValue).forEach(key => {
                            if(Object.prototype.toString.call(newValue[key]) === '[object Array]') {
                                newValue[key] = newValue[key].toString();
                            }
                            if(!newValue[key]) {
                                delete newValue[key]
                            }
                        });
                    }

                    // console.log(newValue);
                    this.props.onChange(newValue);
                } catch (error) {
                    // console.log(error);
                }
            }
        });
    }

    // 催服状态要相加
    getValueTotal = (arr = []) => {
        let total = 0;
        arr.forEach(item => {
            total = (total + Number(item))
        });
        return total.toFixed(0)
    };

    // 手动验证
    handleTextRange = (key) => {
        const newKey = key.split(nameSpace)[0];
        const {getFieldValue} = this.props.form;
        const search = this.props.search;
        const start = getFieldValue(`${newKey}${textRangeStart}`);
        const end = getFieldValue(`${newKey}${textRangeEnd}`);
        if (start > end) {
            for (let i = 0; i < search.length; i++) {
                if (search[i].key === newKey) {
                    message.info(`${search[i].label}验证未通过`);
                    return false;
                }
            }
        }
        return true;
    };

    // 报错提示
    throwError = (key) => {
        const newKey = key.split(nameSpace)[0];
        const search = this.props.search;
        for (let i = 0; i < search.length; i++) {
            if (search[i].key === newKey) {
                message.info(`${search[i].label}验证未通过`);
                return false;
            } else {
                message.info(`验证未通过`);
                return false;
            }
        }
        return false;
    };

    // 获取当前选中的条目
    getCurrentSearchItem = (key) => {
        const newKey = key.split(nameSpace)[0];
        const search = this.props.search;
        for (let i = 0; i < search.length; i++) {
            if (search[i].key === newKey) {
                return search[i];
            }
        }
        return null
    };

    clear () {
        this.props.form.resetFields();
        this.props.onReset && this.props.onReset();
    }

    render () {
        const {search, background} = this.props;
        // 配置信息
        const width = 215;
        const fontSize = '12px';
        const labelConfig = {
            labelCol: {
                span: 7,
                fontSize: fontSize
            },
            style: {
                fontSize: fontSize,
                width: '310px',
                marginRight: '0'
            }
        };
        const datePickConfig = {
            lang: {
                rangePlaceholder: ['-', '-']
            }
        };
        const headStyle = {
            fontSize: fontSize, minHeight: '40px'
        };
        const bodyStyle = {
            padding: '2px'
        };
        const {getFieldDecorator} = this.props.form;
        const list = search.map((item, index) => {
            const {label, key, type, option, keyList, maxLength, defaultValue, disabledDate, multiple, disabled} = item;
            if (type === 'text') {
                // 纯文本
                return (
                    <FormItem
                        key={index}
                        label={label}
                        {...labelConfig}>
                        {getFieldDecorator(key)(
                            <Input type={type} style={{width: width}} maxLength={maxLength} placeholder={`请输入${label}`}/>
                        )}
                    </FormItem>
                );
            } else if (type === 'textSelect') {
                // 文本联动
                return (
                    <div key={index} style={{width: '310px', textAlign: 'right', display: 'inline-block'}}>
                        <FormItem
                            label={label}
                            key={`option_${index}`}
                            style={{marginRight: '5px'}}
                            {...labelConfig.labelCol}>
                            {getFieldDecorator(`option_${key}`, {
                                initialValue: defaultValue ? defaultValue[0] : keyList[0].key
                            })(
                                <Select style={{width: (width / 2 - 5)}} placeholder={label}>
                                    {keyList.map((i) => {
                                        return (
                                            <Option key={i.key} value={i.key}>{i.label}</Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            style={{marginRight: '5px'}}
                            {...labelConfig.labelCol}>
                            {getFieldDecorator(`optionValue_${key}`, {
                                initialValue: defaultValue ? defaultValue[1] : null
                            })(
                                <Input type={type} maxLength={maxLength} style={{width: width / 2}} placeholder={`请输入`}/>
                            )}
                        </FormItem>
                    </div>
                )
            } else if (type === 'textrange') {
                // 关联文本
                return (
                    <div key={index} style={{width: '310px', textAlign: 'right', display: 'inline-block'}}>
                        <FormItem
                            label={label}
                            style={{marginRight: '0'}}
                            {...labelConfig.labelCol}>
                            {getFieldDecorator(`${key}${textRangeStart}`)(
                                <Input type={type} style={{width: width / 2 - 5}} placeholder={label}/>
                            )}
                        </FormItem>
                        <span className='space-mark'>~</span>
                        <FormItem
                            style={{marginRight: '5px'}}>
                            {getFieldDecorator(`${key}${textRangeEnd}`)(
                                <Input type={type} style={{width: width / 2 - 5}} placeholder={label}/>
                            )}
                        </FormItem>
                    </div>
                );
            } else if (type === 'select') {
                // 选择框
                return (
                    <FormItem
                        key={index}
                        label={label}
                        {...labelConfig}>
                        {getFieldDecorator(key, {
                            initialValue: defaultValue ? defaultValue[0] : undefined
                        })(
                            <Select showSearch
                                    optionFilterProp="children"
                                    allowClear
                                    mode={multiple ? 'multiple' : null}
                                    disabled={disabled}
                                    style={{width: width}} placeholder={`请选择${label}`}>
                                {option.map((i) => {
                                    return (
                                        <Option key={i.code || i.value} value={i.code || i.value}>{i.name || i.label}</Option>
                                    );
                                })}
                            </Select>
                        )}
                    </FormItem>
                );
            } else if (type === 'daterange') {
                // 日期选择
                return (
                    <FormItem
                        key={index}
                        label={label}
                        {...labelConfig}>
                        {getFieldDecorator(`${key}_${type}`, {
                            initialValue: defaultValue && defaultValue.length > 0 ? [
                                defaultValue && moment(defaultValue[0], 'YYYY-MM-DD'),
                                defaultValue && moment(defaultValue[1], 'YYYY-MM-DD')
                            ] : null
                        })(
                            <RangePicker
                                locale={datePickConfig}
                                style={{width: width}}
                                disabledDate={disabledDate ?  disabledDateFunc : null}
                                format="YYYY-MM-DD"/>
                        )}
                    </FormItem>
                );
            } else {
                return null;
            }
        });
        return (
            <Card bordered={false}
                  headStyle={headStyle}
                  bodyStyle={bodyStyle}>
                <div className="search" id="search" style={{background: background}}>
                    <div className="search-area">
                        <Form layout="inline">
                            {list}
                        </Form>
                    </div>
                    <div className="search-btn">
                        <Button className="search-btn__cancel" onClick={this.clear.bind(this)}>重置</Button>
                        <Button className="search-btn__submit" type="primary" icon="search" onClick={this.search.bind(this)}>搜索</Button>
                    </div>
                </div>
            </Card>
        );
    }
}

Search = Form.create()(Search);

export default Search;
