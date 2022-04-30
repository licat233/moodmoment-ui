// pages/AdMonitor/panel.ts
import { formatDate, nowLogicDate, formatDateDetail } from '../../utils/time';

// interface PanelData {
//   total_cny: Number; //总人民币
//   total_twd: Number; //总台币
//   start_date: String; //开始日期
//   end_date: String; //结束日期
// }

interface ResponseData {
  success: boolean;
  message: string;
  data: Statistics | null;
}

interface Statistics {
  id: number;
  channelId: number;
  accountId: number;
  cost: string;
  costCny: string;
  imp: string;
  click: string;
  ctr: string;
  cv: string;
  cvr: string;
  cpa: string;
  type: string;
  currency: string;
  status: boolean;
  recordDate: string;
  createAt: string;
  updateAt: string;
}

interface ChannelInfo {
  id: number;
  name: string;
  accounts: AccountInfo[];
}

interface AccountInfo {
  id: number;
  name: string;
  nickname: string;
  isChecked: boolean;
  disabled: boolean;
}

interface RequestStatisticsParams {
  channelId: number;
  accountIds: number[];
  startDate: string;
  endDate: string;
}

const hostPrefix: string = "https://admonitor.catli.net/api_server";
const defaultStatistic: Statistics = {
  id: 0,
  channelId: 0,
  accountId: 0,
  cost: "0.00",
  costCny: "0.00",
  imp: '0',
  click: '0',
  ctr: "0.00%",
  cv: '0',
  cvr: "0.00%",
  cpa: "0.00",
  currency: "TWD",
  type: 'logic',
  status: false,
  recordDate: formatDate(nowLogicDate()),
  createAt: '',
  updateAt: ''
}
const defaultChannels: ChannelInfo[] = [
  {
    id: 1,
    name: "popin",
    accounts: [
      { id: 1, name: 'Wang_skin01', nickname: "鸡皮肤1户", isChecked: true, disabled: false },
      { id: 2, name: 'Self_White', nickname: '祛斑1户', isChecked: false, disabled: false }
    ]
  },
  {
    id: 2,
    name: "line",
    accounts: [
      { id: 1, name: 'A28490221213', nickname: "祛斑", isChecked: false, disabled: false },
      { id: 2, name: 'A79362240622', nickname: "鸡皮肤", isChecked: false, disabled: false }
    ]
  },
  {
    id: 3,
    name: "dable",
    accounts: [
      { id: 1, name: 'A28490221213', nickname: "祛斑", isChecked: false, disabled: false },
      { id: 2, name: 'A79362240622', nickname: "鸡皮肤", isChecked: false, disabled: false }
    ]
  }
]
// interface RequestChannelsParams {

// }

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statistics: defaultStatistic,
    start_date: formatDate(nowLogicDate()),
    end_date: formatDate(nowLogicDate()),
    isEmpty: true,
    isShowDateCheck: false,
    //渠道-账号
    channels: defaultChannels,
    channel_index: 0,
    isFirstLoad: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.firstRequestStatistics();
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

  /**
   * 请求statistics数据
   */
  requestStatistics() {
    //判断是否有渠道
    if (this.data.channels.length === 0) return;
    const current_channel = this.data.channels[this.data.channel_index]
    //判断渠道是否存在
    if (current_channel === undefined) return;
    //判断渠道内是否有账号
    const accounts = current_channel.accounts;
    if (accounts.length === 0) return;
    //TODO：准备开发支持多个账号
    const check_accounts: number[] = [];
    accounts.forEach((account) => {
      if (account.isChecked) {
        check_accounts.push(account.id);
      }
    });
    //如果没有选中账号，则empty
    if (check_accounts.length === 0) {
      console.log("没有选中账户")
      this.setData({
        statistics: defaultStatistic,
        isEmpty: true,
      })
      return;
    };

    const startDate = this.data.start_date;
    const endDate = this.data.end_date;
    this.setData({ isLoading: true });
    if (new Date(startDate) > new Date(endDate) || new Date(startDate) > new Date()) {
      return;
    }
    const params: RequestStatisticsParams = {
      channelId: current_channel.id,
      accountIds: check_accounts,
      startDate,
      endDate
    }
    const _this = this;
    wx.request({
      url: hostPrefix + '/statistics',
      method: 'POST',
      data: params,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.statusCode === 200) {
          const result = res.data as ResponseData
          // console.log(result)
          if (result.success) {
            const statistics = result.data as Statistics
            _this.setData({
              statistics: statistics,
              isEmpty: false
            });
          }
        }
      },
      fail() {
        _this.setData({
          isEmpty: true,
        })
      },
    });
  },

  /**
   * 第一次加载
   */
  firstRequestStatistics() {
    this.requestStatistics();
    this.setData({
      isFirstLoad: false,
    });
  },
  /**
   * 打开日期选择器
   */
  showDateCheck() {
    if (this.data.isShowDateCheck) return;
    this.setData({ isShowDateCheck: true });
  },
  /**
   * 关闭日期选择器
   */
  closeDateCheck() {
    if (!this.data.isShowDateCheck) return;
    this.setData({ isShowDateCheck: false });
  },

  /**
 * 日期改变事件
 */
  dateSubmit(e: any) {
    // console.log(e);
    // if (e.currentTarget.id !== "dateRange") return;
    const startDate = formatDateDetail(e.detail.start.year, e.detail.start.month, e.detail.start.date)
    const endDate = formatDateDetail(e.detail.end.year, e.detail.end.month, e.detail.end.date)
    const startEqual = startDate === this.data.start_date
    const endEqual = endDate === this.data.end_date
    if (startEqual && endEqual) return;
    if (!startEqual) {
      this.setData({ start_date: startDate });
    }
    if (!endEqual) {
      this.setData({ end_date: endDate });
    }
    this.requestStatistics();
  },

  /**
   * 渠道标签改变事件
   */

  onTabsChannelChangeEvent(e: any): void {
    const index = e.detail.currentIndex;
    this.setData({
      channel_index: index
    })
  },

  /**
   * 账号选择框改变事件
   */
  onCheckAccountHandler(e: any): void {
    const accountIndex = +e.detail.key;
    const accountChecked = e.detail.checked;
    const channels = this.data.channels;
    channels[this.data.channel_index].accounts[accountIndex].isChecked = accountChecked;
    this.setData({
      channels: channels
    })
  }
})