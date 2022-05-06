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
interface RequestOption {
  url: string,
  method: "POST" | "OPTIONS" | "GET" | "HEAD" | "PUT" | "DELETE" | "TRACE" | "CONNECT" | undefined,
  data: string | Record<string, any> | ArrayBuffer | undefined,
}

interface BaseRequstOption {
  url: string,
  data: string | Record<string, any> | ArrayBuffer | undefined,
}