import dayjs, { Dayjs } from "dayjs";

/**
 * the number of stars that could be achieved
 * at a given point of time (in the past or future)
 *
 * @param time the point of time to check
 * @param year year of the event
 * @returns the number of stars that can be achieved at that time
 */
export function achievableStars(time: Dayjs, year: number): number {
  const start = unlockDate(year, 1);
  const end = unlockDate(year, 25);

  // is this event over or didn't even start yet?
  if (time.isBefore(start)) return 0;
  if (time.isAfter(end)) return 50;

  // has the current day been unlocked yet?
  const todayUnlock = unlockDate(year, time.date());
  if (time.isAfter(todayUnlock)) return time.date() * 2;
  else return (time.date() - 1) * 2;
}

/**
 * returns the unlock date of a puzzle
 *
 * @param year year of the event
 * @param day day of the event in that year
 * @returns the unlock date on that given day
 */
export function unlockDate(year: number, day: number): Dayjs {
  return dayjs(`${year}-12-${day.toString().padStart(2, "0")}T05:00:00.000Z`);
}

/**
 * some days had outages and have not been considered
 * for the star calculation, so we need to skip them
 *
 * @param year year of the event
 * @param day day of the event in that year
 * @returns if the given day is an outage day
 */
export function isOutageDay(year: number, day: number): boolean {
  return (year === 2018 && day === 6) || (year === 2020 && day === 1);
}
