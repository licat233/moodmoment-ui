// pages/AdMonitor/panel.ts
import { formatDate, nowLogicDate, formatDateDetail } from '../../utils/time';
import { twd2cny, cny2twd } from '../../utils/calculate';

// interface PanelData {
//   total_cny: Number; //总人民币
//   total_twd: Number; //总台币
//   start_date: String; //开始日期
//   end_date: String; //结束日期
// }

interface ResponseData {
  success: boolean;
  message: string;
  data: any;
}

interface StatisticsData {
  Account: string;
  Click: number;
  Cost: number;
  Cpa: number;
  CreateAt: string;
  Ctr: number;
  Currency: string;
  Cv: number;
  Cvr: number;
  Id: number;
  Imp: number;
  RecordDate: string;
  Status: number;
  Type: string;
  UpdateAt: string;
}

interface Statistics {
  Cost: string;
  Imp: number;
  Click: number;
  Ctr: string;
  Cv: number;
  Cvr: string;
  Cpa: string;
  Currency: string;
}

interface AccountInfo {
  value: string;
  isChecked: boolean;
  disabled: boolean;
}

interface RequestStatisticsParams {
  channel: string;
  accounts: string[];
  startDate: string;
  endDate: string;
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statistics: {
      Imp: 0,
      Click: 0,
      Cost: "0.00",
      Cpa: "0.00",
      Ctr: "0.00%",
      Cv: 0,
      Cvr: "0.00%",
      Currency: "TWD"
    },
    total_cny: "0.00",
    total_twd: "0.00",
    start_date: formatDate(nowLogicDate()),
    end_date: formatDate(nowLogicDate()),
    isEmpty: true,
    isShowDateCheck: false,
    //渠道-账号
    channel_list: [
      {
        id: 0,
        name: "popin",
        // account_list: ["Wang_skin01", "Self_White"],
        // account_index: 0,
        accounts: [
          { value: 'Wang_skin01', isChecked: false, disabled: false },
          { value: 'Self_White', isChecked: false, disabled: false }
        ]
      },
      {
        id: 1,
        name: "line",
        // account_list: ["A28490221213", "A79362240622"],
        // account_index: 0,
        accounts: [
          { value: 'A28490221213', isChecked: false, disabled: false },
          { value: 'A79362240622', isChecked: false, disabled: false }
        ]
      }
    ],
    channel_index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.requestStatistics();
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
    if (this.data.channel_list.length === 0) return;
    const current_channel = this.data.channel_list[this.data.channel_index]
    //判断渠道是否存在
    if (current_channel === undefined) return;
    //判断渠道内是否有账号
    if (current_channel.accounts.length === 0) return;
    //TODO：准备开发支持多个账号
    const check_accounts: string[] = [];
    current_channel.accounts.forEach((account: AccountInfo) => {
      if (account.isChecked) {
        check_accounts.push(account.value);
      }
    });
    //如果没有选中账号，则empty
    if (check_accounts.length === 0) {
      const data: Statistics = {
        Cost: '',
        Imp: 0,
        Click: 0,
        Ctr: '',
        Cv: 0,
        Cvr: '',
        Cpa: '',
        Currency: 'TWD'
      }
      this.setData({
        total_cny: "0.00",
        total_twd: "0.00",
        statistics: data,
        isEmpty: true,
      })
      return;
    };

    const startDate = this.data.start_date;
    const endDate = this.data.end_date;
    const channel = current_channel.name;
    const accounts = check_accounts;
    this.setData({ isLoading: true });
    if (new Date(startDate) > new Date(endDate) || new Date(startDate) > new Date()) {
      return;
    }
    const params: RequestStatisticsParams = {
      channel: channel,
      accounts: accounts,
      startDate: startDate,
      endDate: endDate
    }
    const _this = this;
    wx.request({
      url: 'https://wx.api.catli.net/admonitor/statistics',
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
            const statistics = result.data as StatisticsData
            let cny = "0.00";
            let twd = "0.00";
            if (statistics.Currency === "TWD") {
              twd = statistics.Cost + "";
              cny = twd2cny(statistics.Cost)
            } else if (statistics.Currency === "CNY") {
              cny = statistics.Cost + "";
              twd = cny2twd(statistics.Cost);
            };
            let ctr = statistics.Ctr == 0 ? "0.00%" : statistics.Ctr + "%";
            let cvr = statistics.Cvr == 0 ? "0.00%" : statistics.Cvr + "%";
            let cpa = statistics.Cpa == 0 ? "0.00" : statistics.Cpa + "";
            const newData: Statistics = {
              Imp: statistics.Imp,
              Click: statistics.Click,
              Cost: statistics.Cost + "",
              Cpa: cpa,
              Ctr: ctr,
              Cv: statistics.Cv,
              Cvr: cvr,
              Currency: statistics.Currency
            }
            _this.setData({
              statistics: newData,
              total_cny: cny,
              total_twd: twd,
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
    const channel_list = this.data.channel_list;
    channel_list[this.data.channel_index].accounts[accountIndex].isChecked = accountChecked;
    this.setData({
      channel_list: channel_list
    })
  }
})