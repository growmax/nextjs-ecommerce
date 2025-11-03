import { isValid } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns/format";
/**
 *
 * @param {*} value value
 * @returns {*} return Value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DateWithTimeFormat(value: any) {
  const tempDate = new Date(value);
  const data = format(tempDate, "dd/MM/yyyy, hh:mm a");
  return data;
}

export const zoneDateTimeCalculator = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: any,
  timeZone: string = "Asia/Kolkata",
  DateFormat: string = "dd/MM/yyyy",
  TimeFormat: string = "hh:mm a",
  time: boolean = false
) => {
  if (date) {
    const zonedDate = toZonedTime(date, timeZone || "Asia/Kolkata");
    if (time) {
      const data = format(
        zonedDate,
        `${DateFormat || "dd/MM/yyyy"} ${TimeFormat || "hh:mm a"}`
      );
      return data;
    } else {
      const dateResult = format(zonedDate, DateFormat || "dd/MM/yyyy");
      return dateResult;
    }
  }
  return undefined;
};
/**
 *
 * @param {*} value value
 * @returns {*} return Value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DateLocalFormat(value: any) {
  const tempDate = new Date(value);
  const data = format(tempDate, "dd/MM/yyyy");
  return data;
}
/**
 *
 * @param {*} value value
 * @returns {*} return Value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DateISOFormat(value: any) {
  let time: string | undefined;
  if (isValid(value)) {
    const tzoffset = new Date(value).getTimezoneOffset() * 60000;
    const localISOTime = new Date(value - tzoffset).toISOString().slice(0, -1);
    time = localISOTime.split(".")[0];
  }
  return time;
}
