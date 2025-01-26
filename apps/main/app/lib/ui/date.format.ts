import { CalendarDate } from "@internationalized/date";

const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};
export function formatDateTime(
  date: Date | string,
  locale: string,
  timeZone: string
) {
  return new Date(date).toLocaleDateString(locale, {
    ...dateTimeFormatOptions,
    timeZone,
  });
}

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};
export function formatDate(
  date: Date | string,
  locale: string,
  timeZone: string
) {
  return new Date(date).toLocaleDateString(locale, {
    ...dateFormatOptions,
    timeZone,
  });
}

export function toCalendarDate(dateStr: string) {
  const date = new Date(dateStr);
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

/**
 * @param birthday of the form YYYY-MM-DD
 */
export function getAge(birthday: string): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
