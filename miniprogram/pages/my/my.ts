// pages/my/my.ts

interface UserInfo {
  name: string;
  avatar: string;
}

const defaultUserInfo: UserInfo = {
  name: "无名宝",
  avatar: ""
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: defaultUserInfo
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const cacheData = wx.getStorageSync("userInfo");
    const userInfo: UserInfo = {
      name: cacheData.nickName,
      avatar: cacheData.avatarUrl,
    }
    this.setData({
      userInfo: userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        wx.setStorageSync("userInfo", res.userInfo)
        const newUserInfo: UserInfo = {
          name: res.userInfo.nickName,
          avatar: res.userInfo.avatarUrl
        }
        this.setData({
          userInfo: newUserInfo
        })
      }
    })
  },
})