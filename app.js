//app.js
App({
  /********************全局变量******************************/
  openid: null,
  serverUrl: "https://192.168.1.171:8443",
  locaitonInfo: null,
  userInfo: null,
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

  /**********************获取位置**********************************/
  getLocation: function(cb) {
    var that = this;

    if (this.locaitonInfo) {
      typeof cb == "function" && cb(this.locaitonInfo);
    } else {
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          // 引入SDK核心类
          var QQMapWX = require('./utils/qqmap-wx-jssdk.min.js');
          // 实例化API核心类
          var demo = new QQMapWX({
            key: 'AIWBZ-KCJHO-R25WB-SPUSP-6LZGE-52F3M' // 必填
          });
          // 调用接口
          demo.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function (res) {
              that.locaitonInfo = {
                address: res.result.address,
                lat: res.result.ad_info.location.lat,
                lng: res.result.ad_info.location.lng
              }
              typeof cb == "function" && cb(that.locaitonInfo);
            },
            fail: function (res) {
              wx.hideLoading();
              wx.showModal({
                title: '错误提示',
                content: '定位失败，请退出重试',
              })
            }
          });
        },
        fail: function (res) {
          wx.showModal({
            title: '错误提示',
            content: '定位失败，请退出重试',
          })
        }
      })
    }
  },

  /**********************获取openid**********************************/
  getOpenid: function (cb) {
    typeof cb == "function" && cb('onk0L0ZR6KFoO1wOBSq6dVVZwzZQ');
    return;
    var that = this;
    if (this.openid) {
      typeof cb == "function" && cb(this.openid);
    } else {
      //调用登录接口
      wx.login({
        success: function (loginCode) {
          that.getUserData(loginCode.code, cb);
        }
      })
    }
  },

  getUserData: function (jsCode, cb) {
    var that = this;
    var appid = "wxc586b8dcb50ea8c4";
    var secret = "48e59985e5a72f3c37866dc0e1308698";

    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&grant_type=authorization_code&js_code=' + jsCode,
      header: { 'content-type': 'application/json' },
      method: 'GET',
      success: function (res) {
        that.openid = res.data.openid;
        typeof cb == "function" && cb(res.data.openid);
      },
      fail: function (res) {
        typeof cb == "function" && cb(null);
      }
    });
  }
  /********************************************************/
})