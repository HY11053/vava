const app = getApp();
Component({

  properties: {

  },

  data: {

  },

  methods: {
    getFormId: function (e) {
      wx.request({
        url: app.globalData.baseUrl+"phonecomplate", //请求地址
        method: 'POST',
        dataType: 'json',
        data:{
          formid:e.detail.formId,
        },
        success: function (res) {
          console.log(e.detail.formId)
        },
        fail: function (err) {
          console.log('错误码：' + err.errCode);
          console.log('错误信息：' + err.errMsg);
        }
      });
    }
  }
})
