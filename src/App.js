import React, {Component} from 'react';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom'
import { ConfigProvider } from 'antd';
// component
import Login from '@/view/login/login';
import Business from '@/view/business/index';
// function
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

class App extends Component {
    // constructor (props) {
    //     super(props);
    // }
    render () {
        return (
            <ConfigProvider locale={zh_CN}>
                <div className="App">
                    <BrowserRouter>
                        <Switch>
                            <Route path="/login" component={Login}/>
                            <Redirect exact from="/" to="/login"/>
                            <Route path="/app" component={Business}/>
                        </Switch>
                    </BrowserRouter>
                </div>
            </ConfigProvider>
        );
    }
}

export default App;
