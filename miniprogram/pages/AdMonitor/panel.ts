// pages/AdMonitor/panel.ts
import { Login } from '../../app';
import { formatDate, nowLogicDate, formatDateDetail } from '../../utils/time';
const app = getApp<IAppOption>()
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

interface CacheUserCheck {
  channelId: number;
  accountIds: number[];
}

interface PanelSet {
  userChecked: CacheUserCheck;
}

/** 默认数据 */
const hostPrefix: string = app.globalData.monitorHostPrefix;
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
const defaultChannelsAccountsRequest: ChannelsAccountsRequest = {
  channelStatus: -1,
  accountStatus: 1,
}
const massages: Record<string, string> = {
  noData: 'no analytics data',
  noAccount: 'no account',
  noChecked: 'no checked account',
  serverError: 'server error',
  loadingData: 'Loading data ...',
  noPowerView: 'not authorized'
}

const defaultDate: string = formatDate(nowLogicDate())

/** 默认数据end */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statistics: defaultStatistic,
    start_date: defaultDate,
    end_date: defaultDate,
    isEmpty: true,
    isShowDateCheck: false,
    //渠道-账号
    channels: defaultChannels,
    current_channel_index: 0,
    isFirstLoad: true,
    massage: massages.loadingData,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.requestChannelsAndAccounts()
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
    this.requestChannelsAndAccounts().finally(() => {
      wx.stopPullDownRefresh();
    })
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
    Login()
  },

  /**
   * 语法糖，根据channel_id获取channel_index
   */
  getChannelIndex(channelId: number): number | null {
    const channels = this.data.channels;
    const n = channels.length;
    for (let i = 0; i < n; i++) {
      if (channels[i].id === channelId) {
        return i
      }
    }
    return null
  },

  /**
   * 语法糖，验证cacheAccount_ids是否都存在于指定accounts中
   */
  authCacheAccountIds(accounts: Account[], cacheAccount_ids: number[]): boolean {
    const n = cacheAccount_ids.length;
    for (let i = 0; i < n; i++) {
      if (accounts.findIndex(account => account.id === cacheAccount_ids[i]) == -1) return false;
    }
    return true
  },
  /**
   * 获取checked_account_ids
   */
  getAccountIds(): number[] {
    const account_ids: number[] = [];
    const channel_index = this.data.current_channel_index;
    const channels = this.data.channels;
    if (channel_index >= channels.length) return account_ids;
    const channel = channels[channel_index];
    const accounts = channel.accounts;
    accounts.forEach(account => {
      if (account.isChecked) {
        account_ids.push(account.id);
      }
    })
    return account_ids;
  },
  /**
   * 初始化用户设置
   */
  InitUserSet() {
    const channels = this.data.channels;
    //主要设置channel_index，与accountIds
    //默认的channel_index
    let current_channel_index = this.data.current_channel_index;
    //默认的accountIds
    let accountIds = this.getAccountIds();
    //优先从缓存中获取设置数据
    const cacheUserCheck = this.getUserChecked();
    if (cacheUserCheck === null) return
    const channelIndex = this.getChannelIndex(cacheUserCheck.channelId)
    if (channelIndex === null) return
    current_channel_index = channelIndex;
    const ok = this.authCacheAccountIds(channels[current_channel_index].accounts, cacheUserCheck.accountIds);
    if (ok) {
      accountIds = cacheUserCheck.accountIds
    }
    const accounts = channels[current_channel_index].accounts;
    accounts.forEach(account => {
      account.isChecked = false
    })
    accountIds.forEach(account_id => {
      accounts.forEach(account => {
        if (account.id === account_id) {
          account.isChecked = true
        }
      })
    })
    this.setData({
      current_channel_index: current_channel_index,
      channels: channels
    })
  },
  /**
   * 请求所有渠道数据
   */
  requestChannelsAndAccounts() {
    const _this = this;
    const params = defaultChannelsAccountsRequest;
    return new Promise(function (resolve: (value: unknown) => void, reject: (reason?: any) => void) {
      wx.request({
        url: `${hostPrefix}/channelsAccounts`,
        method: 'POST',
        data: params,
        header: {
          'Authorization': wx.getStorageSync('token')
        },
        success: (res: any) => {
          resolve(res);
        },
        fail(err: any) {
          reject(err)
        }
      })
    }).then((res: any) => {
      if (res.statusCode === 401) {
        this.noPowerHandler();
        return;
      }
      if (res.statusCode === 200) {
        if (res.data.success) {
          const result = res.data as ResponseData
          // console.log(result)
          if (result.success) {
            const channels = result.data as ChannelInfo[]
            this.setData({
              channels: channels,
            });
          }
        }
      }
    }).catch((err: any) => {
      console.log(err)
      _this.setData({
        massage: massages.serverError
      })
    }).finally(() => {
      _this.InitUserSet();
      _this.requestStatistics();
    })
  },

  /**
   * 请求statistics数据
   */
  requestStatistics() {
    const channels = this.data.channels;
    //判断是否有渠道
    if (channels.length === 0) return;
    const current_channel = channels[this.data.current_channel_index]
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
    return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
      wx.request({
        url: hostPrefix + '/statistics',
        method: 'POST',
        data: params,
        header: {
          'Authorization': wx.getStorageSync('token')
        },
        success(res: any) {
          resolve(res)
        },
        fail(err: any) {
          reject(err)
        },
      });
    }).then((res: any) => {
      if (res.statusCode === 401) {
        this.noPowerHandler();
        return;
      }
      if (res.statusCode === 200) {
        const result = res.data as ResponseData
        if (result.success) {
          if (result.data == null) {
            this.setData({
              statistics: defaultStatistic,
              isEmpty: true,
              massage: massages.noData
            })
            return
          }
          const statistics = result.data as Statistics
          this.setData({
            statistics: statistics,
            isEmpty: false
          });
        }
      }
    }).catch((err) => {
      console.log(err)
      this.setData({
        isEmpty: true,
        massage: massages.serverError
      })
    })
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
    this.setData({ start_date: startDate, end_date: endDate });
    // console.log(startDate,"-",endDate)
    // const startEqual = startDate === this.data.start_date
    // const endEqual = endDate === this.data.end_date
    // if (startEqual && endEqual) return;
    // if (!startEqual) {
    //   this.setData({ start_date: startDate });
    // }
    // if (!endEqual) {
    //   this.setData({ end_date: endDate });
    // }
    this.requestStatistics();
  },

  /**
   * 渠道标签改变事件
   */

  onTabsChannelChangeEvent(e: any): void {
    const index = e.detail.currentIndex;
    // const id = +e.detail.activeKey;
    if (index === undefined) return;
    this.setData({
      channel_index: index
    })
    this.setUserChecked();
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
    const accounts = channels[this.data.current_channel_index].accounts;
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
    this.setUserChecked();
    this.requestStatistics();
  },
  /**
   * 存储用户设置
   */
  setUserChecked() {
    const current_channel_index = this.data.current_channel_index;
    const channels = this.data.channels;
    const current_channel_id = channels[current_channel_index].id;
    const accounts = channels[current_channel_index].accounts;
    const account_ids: number[] = []
    accounts.forEach(account => {
      if (account.isChecked) {
        account_ids.push(account.id);
      }
    })
    const panelSet: PanelSet = {
      userChecked: {
        channelId: current_channel_id,
        accountIds: account_ids,
      }
    }
    wx.setStorageSync("panelSet", panelSet)
  },
  /**
   * 取出用户设置
   */
  getUserChecked(): CacheUserCheck | null {
    let panelSet: PanelSet | null = null
    try {
      const value = wx.getStorageSync("panelSet");
      if (value) {
        panelSet = value as PanelSet
      }
    } catch (error) {
      return null
    }
    if (panelSet) return panelSet.userChecked
    return null
  }
})