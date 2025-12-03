import dayjs, { Dayjs } from "dayjs";

/**
 * the number of stars that could be achieved
 * at a given point of time (in the past or future)
 *
 * @param time the point of time to check
 * @param year year of the event
 * @param numDays number of days in that year's event
 * @returns the number of stars that can be achieved at that time
 */
export function achievableStars(time: Dayjs, year: number): number {
  const totalDays = totalNumberOfDays(year);
  const start = unlockDate(year, 1);
  const end = unlockDate(year, totalDays);

  // is this event over or didn't even start yet?
  if (time.isBefore(start)) return 0;
  if (time.isAfter(end)) return 2 * totalDays; // 2 per day

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

/**
 * return the total number of days in the event for a given year
 *
 * @param year year of the event
 * @returns the total number of days in the event for that year
 */
export function totalNumberOfDays(year: number): number {
  return year < 2025 ? 25 : 12;
}

/**
 * return the total number of stars in the event for a given year
 *
 * @param year year of the event
 * @returns the total number of stars in the event for that year
 */
export function totalNumberOfStars(year: number): number {
  return 2 * totalNumberOfDays(year);
}

/**
 * returns whether the given year has a global leaderboard
 *
 * @param year year of the event
 * @returns true if the year has a global leaderboard, false otherwise
 */
export function hasGlobalLeaderboard(year: number): boolean {
  return year < 2025;
}
