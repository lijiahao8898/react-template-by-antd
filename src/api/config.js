import common from './apiList/common';
import account from './apiList/account';
import collection from './apiList/collection';
import caseApi from './apiList/case';

export default {
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: 120000,
    domain: '/api/',
    ...common,
    ...account,
    ...collection,
    ...caseApi

};
