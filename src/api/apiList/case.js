const caseApi = {
    // 案件管理
    caseList: 'cases',                                      // 列表
    updateTracker: (params) => `tracker/${params.id}`,      // 查询
    getCaseTotalAmount: 'cases/amount',                     // 案件列表汇总
    delegate: 'delegate',                                   // 分单
    delegateList: 'delegates',                                                  // 分单列表
    // 催收记录 formDate格式 formDate.get()
    addCaseTrack: (formData) => `case/addcasetrack`,  // 添加催收记录
    caseTrackList: (params) => `case/casetracks`,                               // 催收记录列表
    getCaseTrackDetail: 'case/track/detail',                                    // 催收记录详情
    getBorrowersCase: (params) => `borrower/${params.id}/cases`,                // 查看相关案件
    uploadCases: 'upload/cases',                                                // 导入文件(案件)
    uploadDebts: 'upload/debts',                                                // 导入文件(债权)
    updateCases: (params) => `case/${params.id}`,                               // 删除 、编辑案件
    updateCasesEntrustStatus: (params) => `case/${params.id}/entruststatus`,    // 变更委案状态
    caseTemplateExport: 'case/import/temp',                                     // 案件导入模板下载
    casesExport: 'cases/export',                                                // 案件导出
    withholdElements: 'withhold/elements',                                      // 发起代扣(四要素)

    // 案件详情
    getCaseDetail: (params) => `case/${params.id}/detail`,                       // 案件详情
    getDebtDetail: (params) => `debt/${params.id}/detail`,                       // 债权详情
    getDebtAboutCases: (params) => `debt/${params.id}/cases`,                    // 债权关联案件
    getDebtEnclosures: (params) => `debt/${params.id}/enclosures`,               // 债权附件
    getCaseReypmtenclosures: (params) => `case/${params.id}/reypmtenclosures`,   // 还款凭证
};

export default caseApi
