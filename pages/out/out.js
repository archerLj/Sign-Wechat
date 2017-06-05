import { showWarningToast } from '../../utils/util.js'

var app = getApp();
Page({
  data:{
    comment: null
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '外出',
    })
  },

  /*******************输入框完成事件***************/
  confirm: function(e) {
    this.setData({
      comment: e.detail.value
    })
  },

  /*******************提交************************/
  commit: function() {
    if (!this.data.comment) {
      showWarningToast('事由不能为空');
      return;
    }

      var that = this;

      wx.showLoading({
        title: '提交中...',
        mask: true
      })

    app.getLocation(function (location) {
      wx.request({
        url: app.serverUrl + '/api/addEvent?userid=' + app.userInfo.id + '&actionType=2' + '&latitude=' + location.lat + '&longtitude=' + location.lng + '&address=' + location.address + '&comment=' + that.data.comment,
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          wx.navigateBack({});
        },
        fail: function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '错误提示',
            content: '提交失败，请重试',
          })
        }
      })
    });
  }
})