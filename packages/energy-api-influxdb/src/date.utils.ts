export const addMilliseconds = (date: Date, ms: number): Date =>
  new Date(date.getTime() + ms);
