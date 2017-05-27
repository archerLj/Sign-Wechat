//app.js
App({
  /********************全局变量******************************/
  openid: null,
  serverUrl: "https://192.168.1.171:8443",
  /********************全局变量******************************/

  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  },

  /**********************获取openid**********************************/
  getOpenid: function (cb) {
    var that = this;
    if (this.openid) {
      console.log('a---'+this.openid);
      typeof cb == "function" && cb(this.openid);
    } else {
      //调用登录接口
      wx.login({
        success: function (loginCode) {
          console.log(loginCode);
          that.getUserData(loginCode.code, cb);
        }
      })
    }
  },

  getUserData: function (jsCode, cb) {
    var that = this;
    var appid = "wx9b1e5c0a95ddacd1";
    var secret = "1124ccac745508cbcf992c8c44135047";

    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&grant_type=authorization_code&js_code=' + jsCode,
      header: { 'content-type': 'application/json' },
      method: 'GET',
      success: function (res) {
        console.log(res);
        that.openid = res.data.openid;
        typeof cb == "function" && cb(res.data.openid);
      },
      fail: function (res) {
        console.log(res);
        typeof cb == "function" && cb(null);
      }
    });
  }
  /********************************************************/
})