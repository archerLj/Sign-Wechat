import { checkPhone, showWarningToast } from '../../utils/util.js'

//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    btnName: '签到',
    address: null,
    disableCommit: false,
    lat: null,
    lng: null,
    userInfo: null,
    hiddenSign: true,
    hiddenMain: true,
    departmentText: '部门',
    validateImages: [
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg',
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg',
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg',
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg',
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg'
    ],
    events: [],
    departmentList: null,
    userSignInfo: ['','','','','']
  },

  /***************生命周期*********************/
  onLoad: function () {
    var that = this

    app.getLocation(function(location) {
      that.setData({
        address: location.address,
        lat: location.lat,
        lng: location.lng
      })
    });

    this.getUserInfo();
  },

  onShow: function() {
    if (app.userInfo) {
      this.setData({
        events: []
      })
      this.getTodayEvents();
    }
  },

  /*********************获取签到，签退或外出历史***************/
  getTodayEvents: function() {
    var that = this;
    wx.request({
      url: app.serverUrl + '/api/getTodayEvents?userid=' + app.userInfo.id,
      success: function(res) {
console.log(res);
        for (var i=0; i<res.data.length; i++) {
          var item = res.data[i];
          var event = {
            eventType: item.actionType == 0 ? "签到" : (item.actionType == 1 ? "签退" : "外出"),
            time: item.updateTime,
            comment: item.remark,
            commentClass: (item.remark == "迟到" || item.remark == "早退" || item.remark == "额外时间") ? 'redComment' : 'comment'
          };
          that.data.events.push(event);
        }

        // 设置提交按钮名称
        if (res.data.length == 0) {
          that.data.btnName = '签到';
        } else {
          var signIned = 0;
          var signOuted = 0;
          for (var i = 0; i < res.data.length; i++) {
            var event = res.data[i];
            if (event.actionType == 0) { //签到过
              signIned = 1;
            } else if (event.actionType == 1) { //签退过
              signOuted = 1
            }
          }

          if (signIned == 0) {
            that.data.btnName = '签到';
          } else if (signIned == 1 && signOuted == 0) {
            that.data.btnName = '签退';
          } else {
            that.data.btnName = '签退';
            that.setData({
              disableCommit: true
            })
          }
        }

        that.setData({
          events: that.data.events,
          btnName: that.data.btnName
        });
      },
      fail: function(res) {
        console.log('-----events----');
        console.log(res);
      }
    })
  },

  /*********************签到或签退***************************/
  signCommit: function() {
    var that = this;

    wx.showLoading({
      title: '提交中...',
      mask: true
    })

    var actionType = 0;
    if (this.data.btnName == "签到") {
      actionType = 0;
    } else {
      actionType = 1;
    }

    wx.request({
      url: app.serverUrl + '/api/addEvent?userid=' + app.userInfo.id + '&actionType=' + actionType + '&latitude=' + this.data.lat + '&longtitude=' + this.data.lng + '&address=' + this.data.address,
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        that.setData({
          events: []
        })
        that.getTodayEvents();
        if (that.data.btnName == "签到") {
          that.setData({
            btnName: "签退"
          })
        } else {
          that.setData({
            disableCommit: true
          })
        }
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showModal({
          title: '错误提示',
          content: '提交失败，请重试',
        })
      }
    })
  },

  /****************页面跳转**********************************/
  out: function() {
    wx.navigateTo({
      url: '../out/out',
    })
  },

  history: function() {
    wx.navigateTo({
      url: '../history/history',
    })
  },



  /****************获取用户信息****************************/
  getUserInfo: function() {
    var that = this;
    app.getOpenid(function(openId) {
      wx.request({
        url: app.serverUrl + '/api/getUser?openid=' + openId,
        method: 'GET',
        success: function(res) {
          if(res.data) { //注册过
            that.setData({
              hiddenSign: true,
              hiddenMain: false,
              userInfo: res.data
            })
            app.userInfo = res.data;
            that.getTodayEvents(); //获取当天事件列表
          } else { //未注册
            that.setData({
              hiddenMain: true,
              hiddenSign: false
            })
            that.getDepartments();
          }
        },
        fail: function(res) {
        }
      })
    })
  },

  /****************获取所有的部门信息****************************/
  getDepartments: function() {
    var that = this;
    wx.request({
      url: app.serverUrl + '/api/getAllDepartment',
      method: 'GET',
      success: function(res) {
        that.setData({
          departmentList: res.data
        });
      },
      fail: function(res) {
      }
    })
  },

  /***************输入框完成事件**********************/
  bindconfirm: function(e) {
    var value = e.detail.value;
    var index = parseInt(e.target.dataset.itemindex);
    
    switch (index) {
      case 0: //姓名
      case 1: //工号
      // case 2: //部门
      case 4: //职位
        this.showValid(value, index, value);
        break;
      default: //电话
        this.showValid(checkPhone(value), index, value);
        break;
    }
  },

  showValid: function(valid, index, value) {
    if (valid) {
      this.data.validateImages[index] = "https://192.168.1.171:8443/images/phoneImages/validInput.svg";
      this.data.userSignInfo[index] = value;
      this.setData({
        validateImages: this.data.validateImages,
        userSignInfo: this.data.userSignInfo
      })
    } else {
      this.data.validateImages[index] = "https://192.168.1.171:8443/images/phoneImages/inValidInput.svg";
      this.data.userSignInfo[index] = '';
      this.setData({
        validateImages: this.data.validateImages,
        userSignInfo: this.data.userSignInfo
      })

      // showWarningToast("输入有误!")
    }
  },

  /***************点击部门事件**********************/
  departmentTouch: function(e) {
    var index = parseInt(e.target.dataset.itemindex);
    var that = this;
    var departments = [];
    for (var i = 0; i < this.data.departmentList.length; i++) {
      departments.push(this.data.departmentList[i].name);
    }
    wx.showActionSheet({
      itemList: departments,
      success: function(res) {
        that.setData({
          departmentText: that.data.departmentList[res.tapIndex].name
        })
        that.data.validateImages[index] = "https://192.168.1.171:8443/images/phoneImages/validInput.svg";
        that.data.userSignInfo[index] = that.data.departmentList[res.tapIndex].name;
        that.setData({
          validateImages: that.data.validateImages,
          userSignInfo: that.data.userSignInfo
        })
      }
    })
  },

  /**************注册**********************/
  userSign: function() {

    for (var i = 0; i < this.data.userSignInfo.length; i++) {
      if (!this.data.userSignInfo[i]) {
        showWarningToast('数据格式不正确!');
        return;
      }
    }

    var that = this;
    app.getOpenid(function(openid) {
        wx.showLoading({
          title: '注册中...',
          mask: true
        })
        wx.request({
          url: app.serverUrl + '/api/addUser?openid=' + openid +
          '&name=' + that.data.userSignInfo[0] +
          '&jobNum=' + that.data.userSignInfo[1] +
          '&department=' + that.data.userSignInfo[2] +
          '&phoneNum=' + that.data.userSignInfo[3] +
          '&position=' + that.data.userSignInfo[4],
          method: 'POST',
          success: function (res) {
            wx.hideLoading();
            app.userInfo = res.data;
            that.getTodayEvents(); //获取当天事件列表
            that.setData({
              hiddenSign: true,
              hiddenMain: false,
              userInfo: res.data
            })
          },
          fail: function (res) {
            wx.hideLoading();
            wx.showModal({
              title: '错误提示',
              content: '注册失败，请重试',
            })
          }
        })
    })
  }
})
