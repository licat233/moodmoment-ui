export const twd2cny = (twd: number): string => {
  return (twd * 100 / 450).toFixed(2);
}

export const cny2twd = (cny: number): string => {
  return ((cny * 100 * 45) / 1000).toFixed(2);
}