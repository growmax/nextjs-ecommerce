import { z } from "zod";
import { isValid } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns/format";

const dateInputSchema = z.union([
  z.date(),
  z.string(),
  z.number(),
]).refine((value) => {
  const date = new Date(value);
  return isValid(date);
}, "Invalid date input");

const timeZoneSchema = z.string().default("Asia/Kolkata");
const formatSchema = z.string().min(1);

type DateInput = z.infer<typeof dateInputSchema>;

export function dateWithTimeFormat(input: DateInput): string {
  const validatedDate = dateInputSchema.parse(input);
  const date = new Date(validatedDate);

  if (!isValid(date)) {
    throw new Error("Invalid date provided to dateWithTimeFormat");
  }

  return format(date, "dd/MM/yyyy, hh:mm a");
}

export const zoneDateTimeCalculator = (
  date: DateInput | null | undefined,
  timeZone: string = "Asia/Kolkata",
  dateFormat: string = "dd/MM/yyyy",
  timeFormat: string = "hh:mm a",
  includeTime: boolean = false
): string | undefined => {
  if (!date) {
    return undefined;
  }

  const validatedDate = dateInputSchema.parse(date);
  const validatedTimeZone = timeZoneSchema.parse(timeZone);
  const validatedDateFormat = formatSchema.parse(dateFormat);
  const validatedTimeFormat = formatSchema.parse(timeFormat);

  const zonedDate = toZonedTime(validatedDate, validatedTimeZone);

  if (!isValid(zonedDate)) {
    throw new Error("Invalid date after timezone conversion");
  }

  if (includeTime) {
    return format(zonedDate, `${validatedDateFormat} ${validatedTimeFormat}`);
  }

  return format(zonedDate, validatedDateFormat);
};

export function dateLocalFormat(input: DateInput): string {
  const validatedDate = dateInputSchema.parse(input);
  const date = new Date(validatedDate);

  if (!isValid(date)) {
    throw new Error("Invalid date provided to dateLocalFormat");
  }

  return format(date, "dd/MM/yyyy");
}

export function dateISOFormat(input: DateInput): string | undefined {
  const validatedDate = dateInputSchema.parse(input);
  const date = new Date(validatedDate);

  if (!isValid(date)) {
    return undefined;
  }

  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
  return localISOTime.split(".")[0];
}
