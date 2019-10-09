import * as statusAction from './action-type';

const initData = {
    withholdStatus: [],
    repaymentStatus: [],
    repaymentMethod: [],
    partner: [],
    overdueStatus: [],
    compensatoryStatus: [],
    province: [],
    city: [],
    district: [],
    bankList: [],
    productType: [],
    contactStatus: [],
    trackerList: [],
    caseTrackTypes: []
};

export const statusItemList = (state = initData, action) => {
    switch (action.type) {
        case statusAction.WITHHOLD_STATUS:
            return Object.assign({}, state, {
                withholdStatus: action.data
            });
        case statusAction.REPAYMENT_STATUS:
            return Object.assign({}, state, {
                repaymentStatus: action.data
            });
        case statusAction.REPAYMENT_METHOD:
            return Object.assign({}, state, {
                repaymentMethod: action.data
            });
        case statusAction.PARTNER:
            return Object.assign({}, state, {
                partner: action.data
            });
        case statusAction.OVERDUE_STATUS:
            return Object.assign({}, state, {
                overdueStatus: action.data
            });
        case statusAction.COMPENSATORY_STATUS:
            return Object.assign({}, state, {
                compensatoryStatus: action.data
            });
        case statusAction.PROVINCE:
            return Object.assign({}, state, {
                province: action.data
            });
        case statusAction.CITY:
            return Object.assign({}, state, {
                city: action.data
            });
        case statusAction.DISTRICT:
            return Object.assign({}, state, {
                district: action.data
            });
        case statusAction.RESET_DISTRICT:
            return Object.assign({}, state, {
                district: []
            });
        case statusAction.BANK_LIST:
            return Object.assign({}, state, {
                bankList: action.data
            });
        case statusAction.PRODUCT_TYPE:
            return Object.assign({}, state, {
                productType: action.data
            });
        case statusAction.CONTACT_STATUS:
            return Object.assign({}, state, {
                contactStatus: action.data
            });
        case statusAction.TRACKER:
            return Object.assign({}, state, {
                trackerList: action.data
            });
        case statusAction.CASE_TRACK_TYPE:
            return Object.assign({}, state, {
                caseTrackTypes: action.data
            });
        default:
            return state
    }
};
