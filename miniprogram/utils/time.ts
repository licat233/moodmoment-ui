export const formatTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('-') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

export const formatDate = (date: Date): string => {
  const year: number = date.getFullYear();
  const month: any = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
  const day: any = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  return year + '-' + month + '-' + day;
};

export const formatDate2 = (date: Date, fix: string): string => {
  const year: number = date.getFullYear();
  const month: any = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
  const day: any = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  return year + fix + month + fix + day;
};

export const formatDateDetail = (Year: number, Month: number, Day: number): string => {
  const year: number = Year;
  const month: any = Month < 10 ? '0' + Month : Month;
  const day: any = Day < 10 ? '0' + Day : Day;
  return year + '-' + month + '-' + day;
};

export const checkAuditTime = (beginTime: string, endTime: string): boolean => {
  const nowDate = new Date();
  const beginDate = new Date(nowDate);
  const endDate = new Date(nowDate);

  const beginIndex = beginTime.lastIndexOf("\:");
  const beginHour = parseInt(beginTime.substring(0, beginIndex));
  const beginMinute = parseInt(beginTime.substring(beginIndex + 1, beginTime.length));
  beginDate.setHours(beginHour, beginMinute, 0, 0);

  const endIndex = endTime.lastIndexOf("\:");
  const endHour = parseInt(endTime.substring(0, endIndex));
  const endMinute = parseInt(endTime.substring(endIndex + 1, endTime.length));
  endDate.setHours(endHour, endMinute, 0, 0);
  return nowDate.getTime() - beginDate.getTime() >= 0 && nowDate.getTime() <= endDate.getTime();
}

export const nowLogicDate = (): Date => {
  const today = new Date();
  if (checkAuditTime("00:00:00", "09:30:00")) {
    //返回昨天日期
    const yesterday = new Date(today.setDate(today.getDate() - 1))
    return yesterday
  }
  return today
}

export const equalDate = (date1: Date, date2: Date): boolean => {
  return date1.toString() === date2.toString();
}