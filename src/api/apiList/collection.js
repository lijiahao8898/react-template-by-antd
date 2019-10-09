const collectionTool = {
    // 催服专员管理
    addTracker: 'tracker',                                  // 添加
    trackerList: 'trackers',                                // 查询
    updateTracker: (params) => `tracker/${params.id}`,      // 查询
    getTrackerAuth: 'tracker/auth',                         // 查询用户中心是否注册
    getTrackerType: (params) => `tracker/tracktype/${params.mobile}`    // 获取催服专员催服类型
};

export default collectionTool
