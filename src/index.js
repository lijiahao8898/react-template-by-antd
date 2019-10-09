import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '@/store/index';
import './assets/style/main.scss';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
// mockjs 会导致下载文件blob类型乱码
// import '@/api/mock/index';

document.title = '催收中心';

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);

registerServiceWorker();
