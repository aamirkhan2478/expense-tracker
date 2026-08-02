import moment from "moment";

/**
 * Supported date format patterns and their moment.js equivalents.
 */
export const DATE_FORMATS = {
  "DD/MM/YYYY": "DD/MM/YYYY",
  "MM/DD/YYYY": "MM/DD/YYYY",
  "YYYY-MM-DD": "YYYY-MM-DD",
  "DD MMM YYYY": "DD MMM YYYY",
  "MMM DD, YYYY": "MMM DD, YYYY",
  "DD-MM-YYYY": "DD-MM-YYYY",
  "YYYY/MM/DD": "YYYY/MM/DD",
};

export const DATE_FORMAT_KEYS = Object.keys(DATE_FORMATS);

/**
 * Format a date using a named format key.
 * Falls back to "MM/DD/YYYY" if the key is invalid.
 */
export function formatDate(date, formatKey = "MM/DD/YYYY") {
  if (!date) return "";
  const momentFormat = DATE_FORMATS[formatKey] || "MM/DD/YYYY";
  return moment(new Date(date)).format(momentFormat);
}

/**
 * Format a date with a display-friendly label (e.g. "Jul 23, 2026").
 */
export function formatDateLabel(date) {
  if (!date) return "";
  return moment(new Date(date)).format("MMM DD, YYYY");
}

/**
 * Format a date with time.
 */
export function formatDateTime(date, formatKey = "MM/DD/YYYY") {
  if (!date) return "";
  const momentFormat = DATE_FORMATS[formatKey] || "MM/DD/YYYY";
  return moment(new Date(date)).format(`${momentFormat}, h:mm A`);
}

/**
 * Preview a given format key with today's date.
 */
export function previewDate(formatKey) {
  const momentFormat = DATE_FORMATS[formatKey];
  if (!momentFormat) return "";
  return moment().format(momentFormat);
}

/**
 * Legacy wrapper — formats with the old default of DD-MM-YYYY.
 */
export { default as dateFormatLegacy } from "./dateFormat";
