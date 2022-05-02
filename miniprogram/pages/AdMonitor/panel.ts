// pages/AdMonitor/panel.ts
import { formatDate, nowLogicDate, formatDateDetail } from '../../utils/time';

interface ResponseData {
  success: boolean;
  message: string;
  data: unknown;
}

interface Statistics {
  id: number;
  identifier: string;
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

interface RequestStatisticsParams {
  channelId: number;
  accountIds: number[];
  startDate: string;
  endDate: string;
}

interface ChannelDetail {
  name: string;
  email: string;
  passport: string;
  password: string;
  domain: string;
  status: boolean;
  createAt: string;
  updateAt: string;
}

interface AccountDetail {
  aid: string;
  name: string;
  nickname: string;
  channelId: number;
  status: boolean;
  createAt: string;
  updateAt: string;
}

interface Account {
  id: number;
  accountDetail: AccountDetail;
  isChecked: boolean;
  disabled: boolean;
}

interface ChannelInfo {
  id: number;
  channelDetail: ChannelDetail;
  accounts: Account[];
}

interface ChannelsAccountsRequest {
  channelStatus: number;
  accountStatus: number;
}

/** 默认数据 */
const hostPrefix: string = "https://admonitor.catli.net/api_server";
const defaultStatistic: Statistics = {
  id: 0,
  identifier: "0_0_2022-05-01_logic",
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
const defaultChannels: ChannelInfo[] = []
const massages: Record<string, string> = {
  noData: 'no analytics data',
  noAccount: 'no account',
  noChecked: 'no checked account',
  serverError: 'server error',
  loadingData: 'Loading data ...',
  noPowerView: 'not authorized'
}

/** 默认数据end */
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
    massage: massages.loadingData,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.requestChannelsAndAccounts();
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
   * 无权限事件
   */
  noPowerHandler() {
    this.setData({
      massage: massages.noPowerView
    })
  },

  /**
   * 请求所有渠道数据
   */
  requestChannelsAndAccounts() {
    const _this = this;
    const params: ChannelsAccountsRequest = {
      channelStatus: -1,
      accountStatus: 1,
    } 
    wx.request({
      url: `${hostPrefix}/channelsAccounts`,
      method: 'POST',
      data: params,
      header: {
        'Authorization': wx.getStorageSync('token')
      },
      success: (res: any) => {
        if (res.statusCode === 401){
          _this.noPowerHandler();
          return;
        }
        if (res.statusCode === 200) {
          if (res.data.success) {
            const result = res.data as ResponseData
            // console.log(result)
            if (result.success) {
              const channels = result.data as ChannelInfo[]
              _this.setData({
                channels: channels,
              });
            }
          }
        }
      },
      fail(err: any) {
        console.log(err)
        _this.setData({
          massage: massages.serverError
        })
      },
      complete() {
        _this.requestStatistics();
      }
    })
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
    const accounts = current_channel.accounts;
    //判断渠道内是否有账号
    if (accounts.length === 0) {
      //如果没有账号
      this.setData({
        statistics: defaultStatistic,
        isEmpty: true,
        massage: massages.noAccount
      })
      return;
    };
    const check_accounts: number[] = [];
    accounts.forEach((account) => {
      if (account.isChecked) {
        check_accounts.push(account.id);
      }
    });
    //如果没有选中账号，则empty
    if (check_accounts.length === 0) {
      this.setData({
        statistics: defaultStatistic,
        isEmpty: true,
        massage: massages.noChecked
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
        'Authorization': wx.getStorageSync('token')
      },
      success(res) {
        if (res.statusCode === 401){
          _this.noPowerHandler();
          return;
        }
        if (res.statusCode === 200) {
          const result = res.data as ResponseData
          if (result.success) {
            if (result.data == null) {
              _this.setData({
                statistics: defaultStatistic,
                isEmpty: true,
                massage: massages.noData
              })
              return
            }
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
          massage: massages.serverError
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
    if (index === undefined) return;
    this.setData({
      channel_index: index
    })
    this.requestStatistics();
  },

  /**
   * 账号选择框改变事件
   */
  onCheckAccountHandler(e: any): void {
    const accountId = +e.detail.key;
    if (accountId === undefined) return;
    const checkStatus = e.detail.checked;
    if (checkStatus === undefined) return;
    const channels = this.data.channels;
    const accounts = channels[this.data.channel_index].accounts;
    if (accounts === undefined) return;
    const n = accounts.length;
    for (let i = 0; i < n; i++) {
      if (accounts[i].id === accountId) {
        accounts[i].isChecked = checkStatus;
        break;
      }
    }
    this.setData({
      channels: channels
    })
    this.requestStatistics();
  }
})