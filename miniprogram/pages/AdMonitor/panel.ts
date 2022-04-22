// pages/AdMonitor/panel.ts
import { formatDate,nowLogicDate } from '../../utils/time';

interface PanelData {
  total_cny: Number; //总人民币
  total_twd: Number; //总台币
  start_date: String; //开始日期
  end_date: String; //结束日期
}

class Panel {
  /**
   * 页面的初始数据
   */
  data: PanelData = {
    total_cny: 0.00,
    total_twd: 0.00,
    start_date: formatDate(nowLogicDate()),
    end_date: formatDate(nowLogicDate()),
  };

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
  };

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  };

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  };

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  };

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  };

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  };

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  };

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  };

  isEmpty() {
  }
}

Page(new Panel())