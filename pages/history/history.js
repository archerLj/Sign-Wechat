var app = getApp();

Page({
  data: {
    events: []
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '历史记录',
    })

    this.getAllEvents();
  },

  /********************获取历史记录***************/
  getAllEvents: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    var that = this;

    wx.request({
      url: app.serverUrl + '/api/getAllEvents?userid=' + app.userInfo.id,
      success: function (res) {
        wx.hideLoading();
        for (var i = 0; i < res.data.length; i++) {
          var item = res.data[i];
          var event = {
            eventType: item.actionType == 0 ? "签到" : (item.actionType == 1 ? "签退" : "外出"),
            time: item.updateTime,
            comment: item.remark,
            commentClass: (item.remark == "迟到" || item.remark == "早退" || item.remark == "额外时间") ? 'redComment' : 'comment'
          };
          that.data.events.push(event);
        }

        console.log(that.data.events);

        that.setData({
          events: that.data.events
        })
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    })
  }
})