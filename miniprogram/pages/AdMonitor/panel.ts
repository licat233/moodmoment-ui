// pages/AdMonitor/panel.ts
import { Login } from '../../app';
import { formatDate, nowLogicDate, formatDateDetail } from '../../utils/time';
import { POST } from '../../utils/network';

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
  type: "logic" | "newest" | "day";
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

interface Channel {
  id: number;
  channelDetail: ChannelDetail;
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
}

interface AccountInfo {
  id: number;
  accountDetail: AccountDetail;
  isChecked: boolean;
  disabled: boolean;
}

interface ChannelInfo {
  id: number;
  channelDetail: ChannelDetail;
  accounts: AccountInfo[];
}

interface ChannelsAccountsRequest {
  channelStatus: number;
  accountStatus: number;
}

interface CacheUserCheck {
  channelId: number;
  accountIds: number[];
  type: TypeInfo;
}

interface PanelSet {
  userChecked: CacheUserCheck;
}

interface TypeInfo {
  key: "logic" | "newest" | "day";
  value: string;
}

interface AlertInfo {
  name: string;
  color: string;
  content: string;
}

interface PutStatusData {
  ids: number[];
  status: boolean;
}

interface Tips {
  status: boolean;
  icon: "success" | "loading" | "error";
  msg: string;
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
  accountStatus: -1,
}
const massages: Record<string, AlertInfo> = {
  noData: { name: "warning", color: "var(--secondary)", content: 'no analytics data' },
  noChannel: { name: "warning", color: "var(--secondary)", content: 'no channel' },
  noAccount: { name: "warning", color: "var(--secondary)", content: 'no account' },
  noChecked: { name: "warning", color: "var(--primary)", content: 'no checked account' },
  serverError: { name: "error", color: "#F4516C", content: 'server error' },
  loadingData: { name: "loading", color: "var(--primary)", content: 'loading...' },
  unauthorized: { name: "warning", color: "#F4516C", content: 'unauthorized' }
}
const statisticsType: { LOGIC: TypeInfo, NEWEST: TypeInfo, DAY: TypeInfo } = {
  LOGIC: {
    key: "logic",
    value: "LOGIC"
  },
  NEWEST: {
    key: "newest",
    value: "NEWEST"
  },
  DAY: {
    key: "day",
    value: "DAY"
  }
}

const defaultDate: string = formatDate(nowLogicDate())
const defaultChannelList: Channel[] = [];
const defaultAccountList: Account[] = [];
const defaultTips: Tips = {
  status: false,
  icon: "error",
  msg: "操作失败"
}
/** 默认数据end */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statistics: defaultStatistic,
    start_date: defaultDate,
    end_date: defaultDate,
    showMessage: true,
    showLoading: true,
    isShowDateCheck: false,
    showSetting: false,
    //渠道-账号
    channels: defaultChannels,
    current_channel_index: 0,
    current_type: statisticsType.LOGIC,
    message: massages.loadingData,
    channel_list: defaultChannelList,
    account_list: defaultAccountList,
    //消息提示
    tips: defaultTips
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.requestChannelList();
    this.requestAccountList();
    this.InitCheckDate();
    this.InitUserSetByCache();
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
    this.InitCheckDate();
    this.InitUserSetByCache();
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
    this.showMessage(massages.unauthorized)
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
  authCacheAccountIds(accounts: AccountInfo[], cacheAccount_ids: number[]): boolean {
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
   * 初始化日期
   */
  InitCheckDate() {
    const start_date = this.data.start_date;
    const end_date = this.data.end_date;
    if (start_date !== end_date) return;
    const logic_date = formatDate(nowLogicDate());
    if (start_date === logic_date) return;
    if (logic_date !== start_date || logic_date !== end_date) {
      this.setData({
        start_date: logic_date,
        end_date: logic_date,
      })
    }
  },
  /**
   * 通过缓存初始化用户设置
   */
  InitUserSetByCache() {
    try {
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
      if (channels.length <= current_channel_index) return;
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
      //默认的type_key
      let current_type = this.data.current_type;
      //缓存的type
      const cacheType = cacheUserCheck.type;
      if (cacheType === undefined) {
        //如果缓存不存在，那就设置一下缓存
        this.setUserChecked()
      } else { //如果存在
        //那就使用缓存
        current_type = cacheType;
      }
      this.setData({
        current_channel_index: current_channel_index,
        channels: channels,
        current_type: current_type
      })
    } catch (error) {
      console.log(error)
      //出错说明缓存有问题
      wx.clearStorage().then(() => {
        //重新加载
        this.onLoad();
      }).catch((err) => {
        console.log(err)
        //既然没法清除缓存，那就重设缓存
        this.setUserChecked();
      })
    }
  },
  /**
   * 请求所有渠道数据
   */
  requestChannelsAndAccounts() {
    const params = defaultChannelsAccountsRequest;
    return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
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
      this.showMessage(massages.serverError)
    }).finally(() => {
      this.requestStatistics();
    })
  },

  /**
   * 请求statistics数据
   */
  requestStatistics() {
    const channels = this.data.channels;
    //判断是否有渠道
    if (channels.length === 0) {
      this.showMessage(massages.noChannel)
      return
    };
    const current_channel = channels[this.data.current_channel_index]
    //判断渠道是否存在
    if (typeof current_channel === "undefined") {
      this.showMessage(massages.noChannel)
      return
    };
    const accounts = current_channel.accounts;
    //判断渠道内是否有账号
    if (accounts.length === 0) {
      this.showMessage(massages.noAccount);
      return
    };
    const check_accounts: number[] = [];
    accounts.forEach((account) => {
      if (account.isChecked) {
        check_accounts.push(account.id);
      }
    });
    //如果没有选中账号，则empty
    if (check_accounts.length === 0) {
      return this.showMessage(massages.noChecked);
    };

    const startDate = this.data.start_date;
    const endDate = this.data.end_date;
    this.setData({ isLoading: true });
    if (new Date(startDate) > new Date(endDate) || new Date(startDate) > new Date()) {
      return this.showMessage(massages.noData);
    }
    let typeKey = this.data.current_type.key;
    if (typeof typeKey === "undefined") {
      typeKey = statisticsType.LOGIC.key
    }
    const params: RequestStatisticsParams = {
      channelId: current_channel.id,
      accountIds: check_accounts,
      startDate,
      endDate,
      type: typeKey
    }
    return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
      this.showMessage(massages.loadingData);
      this.showLoading();
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
            return this.showMessage(massages.noData);
          }
          const statistics = result.data as Statistics
          this.showStatistics(statistics);
        }
      }
    }).catch((err) => {
      console.log(err)
      return this.showMessage(massages.serverError);
    }).finally(() => {
      this.hideLoading();
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
    const startDate = formatDateDetail(e.detail.start.year, e.detail.start.month, e.detail.start.date)
    const endDate = formatDateDetail(e.detail.end.year, e.detail.end.month, e.detail.end.date)
    this.setData({ start_date: startDate, end_date: endDate });
    this.requestStatistics();
  },

  /**
   * 渠道标签改变事件
   */

  onTabsChannelChangeEvent(e: any): void {
    const index = e.detail.currentIndex;
    if (index === undefined) return;
    this.setData({
      current_channel_index: index as number
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
        type: this.data.current_type,
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
  },
  /**
   * 类型切换事件
   */
  swicthTypeHandler(e: any) {
    switch (e.currentTarget.id) {
      case statisticsType.LOGIC.key:
        this.setData({
          current_type: statisticsType.NEWEST
        });
        break;
      case statisticsType.NEWEST.key:
        this.setData({
          current_type: statisticsType.DAY
        });
        break;
      case statisticsType.DAY.key:
        this.setData({
          current_type: statisticsType.LOGIC
        });
        break;
      default:
        break;
    }
    this.setUserChecked();
    this.requestStatistics();
  },
  /**
   * 显示加载动画
   */
  showLoading() {
    this.setData({
      showLoading: true
    })
  },
  hideLoading() {
    this.setData({
      showLoading: false
    })
  },
  /**
   * 设置提示消息
   */
  showMessage(msg: AlertInfo) {
    if (msg.name !== "loading") {
      this.setData({
        showLoading: false
      })
    }
    this.setData({
      showMessage: true,
      message: msg,
      statistics: defaultStatistic,
    })
  },
  /**
   * 隐藏提示消息
   */
  hideMessage() {
    this.setData({
      showLoading: false,
      showMessage: false
    })
  },
  /**
   * 展现数据
   */
  showStatistics(data: Statistics) {
    this.hideLoading();
    const current_channel_index = this.data.current_channel_index;
    const dataChannelIndex = this.getChannelIndex(data.channelId);
    if (current_channel_index !== dataChannelIndex) {
      return;
    }
    this.hideMessage();
    this.setData({
      statistics: data,
    });
  },
  /**
   * 显示设置
   */
  showSettingPanel() {
    this.setData({
      showSetting: true
    })
  },
  /**
   * 隐藏设置
   */
  hideSettingPanel() {
    this.setData({
      showSetting: false
    })
  },
  /**
   * 请求渠道列表
   */
  requestChannelList() {
    return POST({
      url: `${hostPrefix}/channellist`,
      data: { status: -1 }
    }).then((resp: any) => {
      if (resp.statusCode === 200) {
        const res: ResponseData = resp.data as ResponseData
        if (res.success && res.data !== null) {
          const channels = res.data as Channel[];
          this.setData({
            channel_list: channels
          })
        }
      }
    }).catch(err => {
      console.log(err)
    })
  },
  /**
   * 请求账号列表
   */
  requestAccountList() {
    return POST({
      url: `${hostPrefix}/accountlist`,
      data: { status: -1 }
    }).then((resp: any) => {
      if (resp.statusCode === 200) {
        const res: ResponseData = resp.data as ResponseData
        if (res.success && res.data !== null) {
          const accounts = res.data as Account[];
          this.setData({
            account_list: accounts
          })
        }
      }
    }).catch(err => {
      console.log(err)
    })
  },
  /**
  * 请求修改渠道状态
  */
  requestPutChannelStatus(params: PutStatusData) {
    return POST({
      url: `${hostPrefix}/channel/status`,
      data: params
    }).then((resp: any) => {
      if (resp.statusCode === 200) {
        const res: ResponseData = resp.data as ResponseData
        if (res.success) {
          // this.updateChannelStatus(params.ids, params.status)
          return
        }
      }
      this.updateChannelStatus(params.ids, !params.status)
    }).catch(err => {
      console.log(err)
      this.updateChannelStatus(params.ids, !params.status)
    })
  },
  /**
 * 请求修改账号状态
 */
  requestPutAccountStatus(params: PutStatusData) {
    return POST({
      url: `${hostPrefix}/account/status`,
      data: params
    }).then((resp: any) => {
      if (resp.statusCode === 200) {
        const res: ResponseData = resp.data as ResponseData
        if (res.success) {
          // this.updateAccountStatus(params.ids, params.status)
          return
        }
      }
      this.updateAccountStatus(params.ids, !params.status)
    }).catch(err => {
      console.log(err)
      this.updateAccountStatus(params.ids, !params.status)
    })
  },
  /**
   * 恢复原来的channel状态
   */
  // recoveryChannelStatus(params: PutStatusData) {
  //   this.showTips({ status: true, icon: "error", msg: "修改失败" })
  //   //恢复原来的状态
  //   const channelList = this.data.channel_list;
  //   const status = !params.status
  //   params.ids.forEach(id => {
  //     channelList.forEach(channel => {
  //       if (id === channel.id) {
  //         channel.channelDetail.status = status;
  //       }
  //     })
  //   })
  //   this.setData({
  //     channel_list: channelList
  //   })
  // },
  /**
   * 恢复原来的account状态
   */
  // recoveryAccountStatus(params: PutStatusData) {
  //   this.showTips({ status: true, icon: "error", msg: "修改失败" })
  //   //恢复原来的状态
  //   const accountList = this.data.account_list;
  //   const status = !params.status
  //   params.ids.forEach(id => {
  //     accountList.forEach(account => {
  //       if (id === account.id) {
  //         account.accountDetail.status = status;
  //       }
  //     })
  //   })
  //   this.setData({
  //     account_list: accountList
  //   })
  // },
  /**
   * 过滤账号
   */
  filterAccounts(channel_id: number): Account[] {
    const accounts = this.data.account_list;
    return accounts.filter(account => {
      return account.accountDetail.channelId === channel_id
    })
  },
  /**
   * 渠道状态改变事件
   */
  channelStatusSwitch(e: any) {
    // console.log(e)
    const status = !!e.detail.checked;
    const channel_id = +e.currentTarget.id;
    this.updateChannelStatus([channel_id], status);
    this.requestPutChannelStatus({ ids: [channel_id], status });
  },
  /**
   * 账号状态改变事件
   */
  accountStatusSwitch(e: any) {
    // console.log(e)
    const status = !!e.detail.checked;
    const account_id = +e.currentTarget.id;
    this.updateAccountStatus([account_id], status);
    this.requestPutAccountStatus({ ids: [account_id], status });
  },
  /**
   * 语法糖，修改account_list里面的账号状态
   */
  updateAccountStatus(account_ids: number[], status: boolean) {
    if (!Array.isArray(account_ids)) return;
    const account_list = this.data.account_list;
    const n = account_list.length;
    const m = account_ids.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (account_list[i].id === account_ids[j]) {
          account_list[i].accountDetail.status = status;
          break
        }
      }
    }
    this.setData({
      account_list: account_list
    })
  },
  /**
   * 语法糖，修改channel_list单个账号状态
   */
  updateChannelStatus(channel_ids: number[], status: boolean) {
    if (!Array.isArray(channel_ids)) return;
    const channel_list = this.data.channel_list;
    const n = channel_list.length;
    const m = channel_ids.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (channel_list[i].id === channel_ids[j]) {
          channel_list[i].channelDetail.status = status;
          break
        }
      }
    }
    this.setData({
      channel_list: channel_list
    })
  },
  /**
   * 显示Tips
   */
  showTips(tips: Tips) {
    this.setData({
      tips: tips
    })
  }
})