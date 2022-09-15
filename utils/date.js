import { format } from "date-fns";

const MDY = "MMMM dd, yyyy";
const MD = "MMMM dd";

export function getPostDate(d, hideSameDay) {
  if (!d) return null;
  const currYear = new Date().getFullYear();
  const date = new Date(d);
  if (!date) return null;

  if (hideSameDay) {
    if (format(date, MDY) === format(new Date(), MDY)) {
      return null;
    }
  }

  if (currYear === date.getFullYear()) {
    return format(date, MD);
  }

  return format(new Date(date), MDY) || null;
}
