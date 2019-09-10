// pages/indexarticle/indexarticle.js
const util = require('../../utils/util.js')
var app = getApp();
wx.login({
  success: function (res) {
    if (res.code) { //使用小程序登录接口完成后端用户登录
      wx.request({
        url: app.globalData.baseUrl+'getopenid',//你自己api接口的路径
        data: {
          code: res.code,
          appid:app.globalData.appId,
          secret: "9ac061abb49c7904fb2dedd4a20be57b",
        },
        success: function (res) {
          //把openid保存到缓存里
          wx.setStorageSync("openid", res.data.openid);
          wx.setStorageSync("session_key", res.data.session_key);
        }
      })
    } else {
      console.log('获取用户登录态失败！' + res.errMsg)
    }
  }
});
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    cnum:0
  },

  getPhoneNumber:function (e) {
    var that=this
    var detail = e.detail;
    if (detail.iv!=undefined)
    {
      wx.request({
        url: app.globalData.baseUrl+ 'getphonenumber',  //解密手机号码接口
        data: {
          "appid": app.globalData.appId,
          "session_key": wx.getStorageSync('session_key'),
          "encryptedData": detail.encryptedData,
          "iv": detail.iv
        },
        success: function (res) {
          console.log(res.data);
          wx.request({
            url: app.globalData.baseUrl+"phonecomplate", //请求地址
            method: 'POST',
            dataType: 'json',
            data:{
              name:'直接获取',
              phoneno:res.data.phoneNumber,
              note:that.data.indexinfos.shorttitle,
              host:util.getCurrentPageUrlWithArgs(),
              openid:wx.getStorageSync('openid')
            },
            success: function (res) {
              wx.showToast({
                title:res.data,
                duration: 2000,
                mask: true,
                icon: 'none'
              });
            },
            fail: function (err) {
              console.log('错误码：' + err.errCode);
              console.log('错误信息：' + err.errMsg);
            }
          });
        },
      })
    }else {
      //拒绝后展示弹窗
      this.setData({
        showModal: true
      });
      //拒绝后发送消息通知
      wx.request({
        url: app.globalData.baseUrl + "sendmessage", //请求地址
        method: 'POST',
        dataType: 'json',
        data: {
          openid: wx.getStorageSync('openid'),
        },
        success: function (res) {
          console.log(res.data)
        },
        fail: function (err) {
          console.log('错误码：' + err.errCode);
          console.log('错误信息：' + err.errMsg);
        }
      });
    }
  },
  //formid保存
  saveFormid:function(e)
  {
    wx.request({
      url: app.globalData.baseUrl+"savaformid", //请求地址
      method: 'POST',
      dataType: 'json',
      data:{
        formid:e.detail.formId,
      },
      success: function (res) {
        console.log(res.data)
      },
      fail: function (err) {
        console.log('错误码：' + err.errCode);
        console.log('错误信息：' + err.errMsg);
      }
    });
    this.setData({cnum:this.data.cnum+1})
    console.log(this.data.cnum)
    if (this.data.cnum %2==0)
    {
      this.setData({
        showModal: false
      })
    }
  },
  telSubmit: function() {
    this.setData({
      showModal: true
    })
  },
  closeMod: function() {
    this.setData({
      showModal: false
    })
  },

  //拨打电话
  makePhoneCall(e) {
    console.log(e.currentTarget.dataset)
    let phoneNumber=e.currentTarget.dataset.phonenumber
    wx.makePhoneCall({
      phoneNumber,
      fail: err => {
        wx.showModal({
          title: '拨打失败',
          content: '请检查是否输入了正确的电话号码',
          showCancel: false
        });
      }
    });
  },
  formSubmitHandle2: function(e) {
    var  that =this
    if ( e.detail.value.username== '') {
      wx.showToast({
        title:'姓名不能为空',
        duration: 2000,
        mask: true,
        icon: 'none'
      });
      return false;
    }
    // 判断手机号是否正确
    if (!(/^1[34578]\d{9}$/.test(e.detail.value.iphone))) {
      wx.showToast({
        title:'请输入正确的手机号码',
        duration: 2000,
        mask: true,
        icon: 'none'
      });
      return false;
    }
    wx.request({
      url: app.globalData.baseUrl+"phonecomplate", //请求地址
      method: 'POST',
      dataType: 'json',
      data:{
        name:e.detail.value.username,
        phoneno:e.detail.value.iphone,
        note:e.detail.value.content,
        formid:e.detail.formId,
        host:util.getCurrentPageUrlWithArgs(),
        openid:wx.getStorageSync('openid')
      },
      success: function (res) {
        wx.showToast({
          title:res.data,
          duration: 2000,
          mask: true,
          icon: 'none'
        });
      },
      fail: function (err) {
        console.log('错误码：' + err.errCode);
        console.log('错误信息：' + err.errMsg);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 监听页面加载的生命周期函数
    this.setData({realpath:options.id})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  // 监听页面初次渲染完成的生命周期函数
      var that=this
      //品牌列表
      wx.request({
        url: app.globalData.baseUrl+"getfixedtemplate/?id="+that.data.realpath, //请求地址
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          that.setData({ indexinfos:res.data });
          wx.setNavigationBarTitle({
            title: that.data.indexinfos.title
          });
        },
        fail: function (err) {
          console.log('错误码：' + err.errCode);
          console.log('错误信息：' + err.errMsg);
        }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})