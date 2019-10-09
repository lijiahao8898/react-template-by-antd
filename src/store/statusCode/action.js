import Api from '@/api/index';
import * as statusAction from './action-type';

// 获取代扣状态
export const getWithholdStatus = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getWithholdStatus');
        if(data.success) {
            dispatch({
                type: statusAction.WITHHOLD_STATUS,
                data: data.datas.content
            });
        }
    };
};

// 获取还款状态
export const getRepaymentStatus = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getRepaymentStatus');
        if(data.success) {
            dispatch({
                type: statusAction.REPAYMENT_STATUS,
                data: data.datas.content
            });
        }
    };
};

// 获取分配方式
export const getRepaymentMethod = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getRepaymentMethod');
        if(data.success) {
            dispatch({
                type: statusAction.REPAYMENT_METHOD,
                data: data.datas.content
            });
        }
    };
};

// 获取渠道合作方
export const getPartner = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getPartner');
        if(data.success) {
            dispatch({
                type: statusAction.PARTNER,
                data: data.datas.content
            });
        }
    };
};

// 获取逾期状态
export const getOverdueStatus = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getOverdueStatus');
        if(data.success) {
            dispatch({
                type: statusAction.OVERDUE_STATUS,
                data: data.datas.content
            });
        }
    };
};

// 获取还款状态
export const getCompensatoryStatus = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getCompensatoryStatus');
        if(data.success) {
            dispatch({
                type: statusAction.COMPENSATORY_STATUS,
                data: data.datas.content
            });
        }
    };
};

// 省
export const getProvince = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getProvince');
        if(data.success) {
            dispatch({
                type: statusAction.PROVINCE,
                data: data.datas.content
            });
        }
    };
};

// 市
export const getCity = (value = {}) => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getCity', {
            ...value
        });
        if(data.success) {
            dispatch({
                type: statusAction.CITY,
                data: data.datas.content
            });
        }
    };
};

// 区
export const getDistrict = (value = {}) => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getDistrict', {
            ...value
        });
        if(data.success) {
            dispatch({
                type: statusAction.DISTRICT,
                data: data.datas.content
            });
        }
    };
};

export const clearDistrict = (value = {}) => {
    return {
        type: statusAction.RESET_DISTRICT,
        data: []
    };
};

export const getBankList = (value = {}) => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getBankList', {
            ...value
        });
        if(data.success) {
            dispatch({
                type: statusAction.BANK_LIST,
                data: data.datas.content
            })
        }
    }
};

// 产品类型
export const getProductTypes = (value = {}) => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getProductTypes', {
            ...value
        });
        if(data.success) {
            dispatch({
                type: statusAction.PRODUCT_TYPE,
                data: data.datas.content
            })
        }
    }
};

// 可联状态
export const getContactStatus = (value = {}) => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getContactStatuses', {
            ...value
        });
        if(data.success) {
            dispatch({
                type: statusAction.CONTACT_STATUS,
                data: data.datas.content
            })
        }
    }
};

// 获取催服专员
export const getTracker = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'trackerList');
        if(data.success) {
            dispatch({
                type: statusAction.TRACKER,
                data: data.datas.content
            })
        }
    }
};

// 获取催记类型
export const getCaseTrackTypes = () => {
    return async (dispatch, getState) => {
        const data = await Api('get', 'getCaseTrackTypes');
        if(data.success) {
            dispatch({
                type: statusAction.CASE_TRACK_TYPE,
                data: data.datas.content
            })
        }
    }
};
