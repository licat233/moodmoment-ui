// logs.ts
// const util = require('../../utils/util.js')
import { Login } from '../../app';
import { formatTime } from '../../utils/time'
const app = getApp<IAppOption>()

interface LogInfo {
  level: string;
  ts: string;
  caller: string;
  msg: string;
}

const defaultLogs: LogInfo[] = [];

Page({
  data: {
    INFO: "INFO",
    ERROR: "ERROR",
    WRAN: "WARN",
    logs: defaultLogs,
    showError: false,
    errorMsg: "程序异常"
  },
  onLoad() {
    this.requestSysLogs();
  },
  onPullDownRefresh(){
    this.requestSysLogs().finally(()=>{
      wx.stopPullDownRefresh();
    })
  },
  /**
   * 请求系统日志
   */
  requestSysLogs() {
    return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
      wx.request({
        url: app.globalData.monitorHostPrefix + '/monitor_logs',
        method: 'POST',
        header: {
          'Authorization': wx.getStorageSync('token')
        },
        success(res: any) {
          resolve(res)
        },
        fail(err: any) {
          reject(err)
        },
      })
    }).then(res => {
      if ((res as any).statusCode === 401) {
        Login()
        return
      }
      if ((res as any).statusCode === 200) {
        const resp = (res as any).data as ResponseData
        if (resp.success) {
          try {
            // console.log(resp.data)
            const logs: LogInfo[] = resp.data as LogInfo[]
            if (!Array.isArray(logs)) {
              throw "日志数据异常"
            }
            const n = logs.length
            if (n === 0) return;
            for (let i = 0; i < n; i++) {
              logs[i].ts = formatTime(new Date(logs[i].ts))
            }
            this.setData({
              logs: logs,
            })
          } catch (error) {
            console.log(error)
            this.showMessage((error as Error).message)
          }
        }
      }
    }).catch(err => {
      console.log(err)
    })
  },
  /**
   * 错误提示
   */
  showMessage(msg: string) {
    this.setData({
      showError: true,
      errorMsg: msg
    })

  }
})
