// pages/AdMonitor/panel.ts
import { formatDate, nowLogicDate } from '../../utils/time';

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
  Account: string;
  Cost: string;
  Imp: number;
  Click: number;
  Ctr: string;
  Cv: number;
  Cvr: string;
  Cpa: string;
  Currency: string;
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statistics: {
      Account: "",
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.requestStatistics(this.data.start_date, this.data.end_date);
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
   * 开始日期改变事件
   */
  startDateChange(e: any) {
    // console.log(e.detail.value);
    if (e.detail.value === this.data.start_date) return
    this.setData({ start_date: e.detail.value });
    this.requestStatistics(e.detail.value, this.data.end_date);
  },

  /**
   * 结束日期改变事件 
  */
  endDateChange(e: any) {
    // console.log(e.detail.value);
    if (e.detail.value === this.data.end_date) return
    this.setData({ end_date: e.detail.value });
    this.requestStatistics(this.data.start_date, e.detail.value);
  },

  /**
   * 请求statistics数据
   */
  requestStatistics(startDate: string, endDate: string) {
    this.setData({ isLoading: true });
    if (new Date(startDate) > new Date(endDate) || new Date(startDate) > new Date()) {
      return;
    }
    const params = {
      "channel": "popin",
      "account": "Wang_skin01",
      "startDate": startDate,
      "endDate": endDate
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
              Account: statistics.Account,
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
})

function twd2cny(twd: number): string {
  return (twd * 100 / 450).toFixed(2);
}


function cny2twd(cny: number): string {
  return ((cny * 100 * 45) / 1000).toFixed(2);
}