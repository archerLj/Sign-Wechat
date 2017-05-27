import { checkPhone, showWarningToast } from '../../utils/util.js'

//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hiddenSign: true,
    departmentText: '部门',
    validateImages: [
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg',
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg',
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg',
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg',
      'https://192.168.1.171:8443/images/phoneImages/inValidInput.svg'
    ],
    departmentList: null,
    userSignInfo: ['','','','','']
  },

  /***************生命周期*********************/
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })

    this.getUserInfo();
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
            console.log('已经注册')
            that.setData({
              hiddenSign: true
            })
          } else { //未注册
            that.setData({
              hiddenSign: false
            })
            that.getDepartments();
          }
        },
        fail: function(res) {
          console.log(res);
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
        console.log(res);
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
      this.setData({
        validateImages: this.data.validateImages
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
        that.data.userSignInfo[index] = that.data.departmentList[res.tapIndex].id;
        that.setData({
          validateImages: that.data.validateImages,
          userSignInfo: that.data.userSignInfo
        })
      }
    })
  },

  /**************注册**********************/
  userSign: function() {
    var that = this;
    app.getOpenid(function(openid) {
      console.log(openid);
      if (openid) {
        wx.request({
          url: app.serverUrl + '/api/addUser?openid=' + openid +
          '&name=' + that.data.userSignInfo[0] +
          '&jobNum=' + that.data.userSignInfo[1] +
          '&departmentid=' + that.data.userSignInfo[2] +
          '&phoneNum=' + that.data.userSignInfo[3] +
          '&position=' + that.data.userSignInfo[4],
          method: 'POST',
          success: function (res) {
            console.log(res);
          },
          fail: function (res) {
            console.log(res);
          }
        })
      } else {
        showWarningToast('openId为空');
      }
    })
  }
})
