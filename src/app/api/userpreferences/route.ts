import { NextResponse } from "next/server";

// ⏰ Time format options
const timeFormatOptions = [
  { value: "HH:mm", display: "24 hrs" },
  { value: "hh:mm a", display: "12 hrs" },
];

// 📅 Date format options
const d = new Date();
const date = d.getDate();
const month = d.getMonth();
const year = d.getFullYear();

const monthsName = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthsShortName = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const dateFormatOptions = [
  { dateFormatName: `${date}/${month + 1}/${year}`, value: "dd/MM/yyyy" },
  { dateFormatName: `${date}-${month + 1}-${year}`, value: "dd-MM-yyyy" },
  { dateFormatName: `${date}.${month + 1}.${year}`, value: "dd.MM.yyyy" },
  { dateFormatName: `${month + 1}-${date}-${year}`, value: "MM-dd-yyyy" },
  { dateFormatName: `${month + 1}/${date}/${year}`, value: "MM/dd/yyyy" },
  { dateFormatName: `${year}/${month + 1}/${date}`, value: "yyyy/MM/dd" },
  {
    dateFormatName: `${monthsName[month]} ${date}, ${year}`,
    value: "MMMM dd, yyyy",
  },
  {
    dateFormatName: `${monthsShortName[month]} ${date}, ${year}`,
    value: "MMM dd, yyyy",
  },
];

// 🌍 Timezone options
const timeZoneOptions = [
  { key: "(GMT-12:00) International Date Line West", value: "Etc/GMT+12" },
  { key: "(GMT-11:00) Midway Island, Samoa", value: "Pacific/Midway" },
  { key: "(GMT-10:00) Hawaii", value: "Pacific/Honolulu" },
  { key: "(GMT-09:00) Alaska", value: "America/Anchorage" },
  {
    key: "(GMT-08:00) Pacific Time (US & Canada)",
    value: "America/Los_Angeles",
  },
  { key: "(GMT-07:00) Arizona", value: "America/Phoenix" },
  { key: "(GMT-05:00) Eastern Time (US & Canada)", value: "America/New_York" },
  {
    key: "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi",
    value: "Asia/Kolkata",
  },
  { key: "(GMT+09:00) Tokyo", value: "Asia/Tokyo" },
  { key: "(GMT+10:00) Sydney", value: "Australia/Sydney" },
];

// 🚀 GET handler
export async function GET() {
  return NextResponse.json({
    timeFormatOptions,
    dateFormatOptions,
    timeZoneOptions,
  });
}
