const dict = 'dictionaries';

const common = {
    getToken: 'auth/login',                         // 登录
    changePassword: 'auth/pwd',                     // 修改密码
    getMenuList: 'auth/menus',                      // 获取导航信息
    // 状态
    getWithholdStatus: `${dict}/withholdstatuses`,                          // 获取代扣状态
    getRepaymentStatus: `${dict}/repaymentstatuses`,                        // 获取还款状态
    getRepaymentMethod: `${dict}/repaymentmethods`,                         // 获取分配方式
    getPartner: `${dict}/partners`,                                         // 获取渠道合作方
    getOverdueStatus: `${dict}/overduestatuses`,                            // 获取逾期状态
    getCompensatoryStatus: `${dict}/compensatorymethods`,                   // 获取代偿状态
    getBankList: `${dict}/banks`,                                           // 获取银行列表
    getProductTypes: `${dict}/producttypes`,                                // 获取产品类型
    getContactStatuses: `${dict}/contactstatuses`,                          // 获取可联状态
    // 省市区
    getProvince: `${dict}/provinces`,                                       // 省
    getCity: `${dict}/cities`,                                              // 市
    getDistrict: `${dict}/districts`,                                       // 区
    // 催记
    getCaseTrackTypes: `${dict}/casetracktypes`                             // 类型
};

export default common
