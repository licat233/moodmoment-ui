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
                console.log("登录成功")
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

export const Ping = async () => {
  return await new Promise((resolve, reject) => {
    wx.request({
      url: "https://admonitor.catli.net/api_server/ping",
      method: "GET",
      header: { "Authorization": wx.getStorageSync('token') },
      success: (res: any) => {
        switch (res.statusCode) {
          case 200:
            const resp = res.data as ResponseData
            resolve(resp.success)
            return
          case 401:
            reject(false)
            return
          case 500:
            throw "服务器出现错误";
          default:
            throw "ping请求出现错误";
        }
      },
      fail: (err: any) => {
        throw "服务器出现错误" + err;
      }
    });
  })
}

App<IAppOption>({
  globalData: {
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    Ping().catch(() => {
      Login()
    })
  },
})