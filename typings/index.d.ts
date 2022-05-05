/// <reference path="./types/index.d.ts" />
interface ResponseData {
  success: boolean;
  message: string;
  data: unknown;
}
interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    monitorHostPrefix: string,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}