
export const request = (option: RequestOption) => {
  return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
    wx.request({
      ...option,
      header: {
        'Authorization': wx.getStorageSync('token')
      },
      success: (res: any) => {
        resolve(res);
      },
      fail(err: any) {
        reject(err)
      }
    });
  })
}

export const POST = (option: BaseRequstOption) => {
  return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
    wx.request({
      ...option,
      method: "POST",
      header: {
        'Authorization': wx.getStorageSync('token')
      },
      success: (res: any) => {
        resolve(res);
      },
      fail(err: any) {
        reject(err)
      }
    });
  })
}

export const GET = (option: BaseRequstOption) => {
  return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
    wx.request({
      ...option,
      method: "GET",
      header: {
        'Authorization': wx.getStorageSync('token')
      },
      success: (res: any) => {
        resolve(res);
      },
      fail(err: any) {
        reject(err)
      }
    });
  })
}