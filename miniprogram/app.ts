// app.ts


interface ResponseData {
  success: boolean;
  message: string;
  data: unknown;
}

interface TokenData {
  token: number;
}

export const Login = () => {
  // 登录
  wx.login({
    success: res => {
      // console.log(res.code)
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      wx.request({
        url: "https://admonitor.catli.net/api_server/authorizetion",
        method: "POST",
        data: { code: res.code },
        success: (res: any) => {
          if (res.statusCode === 200) {
            if (res.data.success) {
              const result = res.data as ResponseData
              // console.log(result)
              if (result.success) {
                const token = (result.data as TokenData).token;
                wx.setStorageSync('token', token)
              }
            }
          }
        }
      });
    },
  })
}

export const Ping = () => {
  let ok = false;
  new Promise((resolve, reject) => {
    wx.request({
      url: "https://admonitor.catli.net/api_server/ping",
      method: "GET",
      header: { "Authorization": wx.getStorageSync('token') },
      success: (res: any) => {
        if (res.statusCode === 200) {
          ok = res.data.success
        }
      },
      fail: () => {
        resolve(ok)
      }
    });
  }).then(() => {
      return ok
    })
  return ok;
}

App<IAppOption>({
  globalData: {
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    if (!Ping()) Login()
  },
})