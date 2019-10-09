const borrowers = 'borrowers';
const repymtscheds = 'repymtscheds';
const products = 'products';

const account = {
    // 账户管理
    getBorrowerList: `${borrowers}/search`,                                     // 账户管理 - 列表
    detect: 'detect',                                                           // 自动探测 - 列表
    borrowerListExport: `${borrowers}/export`,                                  // 账户管理 - 导出
    getBorrowerPersonalDetail: `${borrowers}/personal/detail`,                  // 账户管理 - 详情 - 个人
    getBorrowerEnterpriseDetail: `${borrowers}/enterprise/detail`,              // 账户管理 - 详情 - 企业
    getBorrowerSearchforamount: `${borrowers}/searchforamount`,                 // 当前页融资总额
    getBorrowerSearchforbalance: `${borrowers}/searchforbalance`,               // 当前页余额总额

    // 还款计划
    getRepaymentScheduleList: `${repymtscheds}/search`,                         // 列表
    repaymentScheduleListExport: `${repymtscheds}/export`,                      // 导出
    repymtschedsSearchforamount: `${repymtscheds}/searchforamount`,             // 应还金额
    repymtschedsSearchforrepymt: `${repymtscheds}/searchforrepymt`,             // 实际还款金额

    // 逾期计划
    getProductList: `${products}/search`,                                                       // 逾期计划 - 列表
    productListExport: `${products}/export`,                                                    // 逾期计划 - 导出
    updatePenaltyAmount: `withhold/amounts/penalty`,                                            // 逾期计划 - 修改罚息
    getWithholdAmount: `withhold/amounts`,                                                      // 逾期计划 - 获取代扣金额
    postWithhold: `withhold`,                                                                   // 逾期计划 - 发起代扣
    productsSearchforamount: 'products/searchforamount',                                        // 逾期计划 - 应还金额
    productsSearchforrepymt: () => 'products/searchforrepymt',                                  // 逾期计划 - 实际还款金额

    // 产品详情
    getRepymtschedsSearchbyproduct: `repymtscheds/searchbyproduct`,                             // 逾期计划 - 还款计划
    // 短信模板
    getSmsTemplates: `sms/templates`,                                                           // 查询短信模板 - 列表
    getSmsTasks: `sms/tasks`,                                                                   // 自动发送 - 列表
    // 短信日志
    getLog: `sms/logs`,                                                                         // 短信日志 - 列表
    // 探测列表
    detectTasks: 'detect/tasks',                                                                // 自动探测 - 列表

    // @债户
    getCustomerList: 'customers',                                                               // 列表
    getCustomerAmountTotal: 'customers/amount',                                                 // 汇总
    getCustomerBankList: (params) => `customer/${params.borrowerId}/bankcards`,                 // 银行卡列表
    addCustomerBank: (params) => `customer/${params.borrowerId}/bankcard`,                      // 添加银行卡
    updateCustomerBank: (params) => `customer/bankcard/${params.bankCardId}`,                   // 修改银行卡
    getCustomerCaseInfo: (params) => `customer/${params.borrowerId}/cases/total`,               // 获取案件信息
    getCustomerContactsList: (params) => `customer/${params.borrowerId}/contacts`,              // 通讯录列表
    setCustomerContactDefault: (params) => `customer/${params.borrowerId}/contact/default`,     // 通讯录列表
    getCustomerPersonalDetail: (params) => `customer/pers/${params.borrowerId}/detail`,         // 个人详情
    getCustomerCompanyDetail: (params) => `customer/ent/${params.borrowerId}/detail`            // 企业详情
};

export default account
