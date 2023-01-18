import { format } from "date-fns";

const MDY = "MMMM dd, yyyy";
const MD = "MMMM dd";

export function getPostDate(d) {
  if (!d) return null;
  const currYear = new Date().getFullYear();
  const date = new Date(d);
  if (!date) return null;

  // if (hideSameDay) {
  //   if (format(date, MDY) === format(new Date(), MDY)) {
  //     console.log(format(date, MDY), format(new Date(), MDY));
  //     return null;
  //   }
  // }

  if (currYear === date.getFullYear()) {
    return format(date, MD);
  }

  return format(new Date(date), MDY) || null;
}

/**
 *
 * @param {string|Date} dateString
 * @returns
 */
export const formatRSSDate = (dateString) =>
  // Tue, 02 Aug 2022 12:51:00 GMT+1
  format(new Date(dateString), "E, d LLL yyyy HH:mm:ss z");
