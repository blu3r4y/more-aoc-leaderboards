import dayjs, { Dayjs } from "dayjs";
import duration, { Duration } from "dayjs/plugin/duration";

import { IApiData, IApiMember } from "./ApiTypes";
import { mapValues, dropNull, median } from "./Utils";

dayjs.extend(duration);

declare interface IPreMember {
  /** the unique id of the member */
  id: number;
  /** name of the member, or its id otherwise */
  name: string;
  /** whether this user did any puzzles */
  active: boolean;
  /** whether this user did all puzzles (50 stars) */
  finished: boolean;
  /** total number of stars */
  total_stars: number;
  /** stars, per day */
  stars: { [day: number]: number };
  /** score on the local leaderboard */
  local_score: number;
  /** score on the global leaderboard */
  global_score: number;
  /** timestamp when the last star was retrieved */
  last_ts: Dayjs | null;
  /** duration from day 1 until the last star was retrieved */
  last_time: Duration | null;
  /** timestamp when part 1 was completed, per day */
  parta_ts: { [day: number]: Dayjs | null };
  /** timestamp when part 2 was completed, per day */
  partb_ts: { [day: number]: Dayjs | null };
  /** duration from unlock to completion of part 1, per day */
  parta_times: { [day: number]: Duration | null };
  /** duration from unlock to completion of part 2, per day */
  partb_times: { [day: number]: Duration | null };
  /** number of times part 1 was completed */
  parta_completed: number;
  /** number of times part 2 was completed */
  partb_completed: number;
  /** delta time between part 1 and 2, per day */
  delta_times: { [day: number]: Duration | null };
  /** total delta time */
  total_delta: Duration | null;
  /** median delta time */
  median_delta: Duration | null;
  /** total duration to complete both parts of a day */
  total_time: Duration | null;
  /** average duration it took to retrieve one star */
  time_per_star: Duration | null;
}

export declare interface IMember extends IPreMember {
  more: number;
}

const ALL_DAYS = Array.from(new Array(25), (_, i) => i + 1);

function unlockDate(year: number, day: number): Dayjs {
  return dayjs(`${year}-12-${day.toString().padStart(2, "0")}T05:00:00.000Z`);
}

export function processData(apiData: IApiData | null): IMember[] | null {
  if (!apiData) return null;
  const { event: year, members: apiMembers } = apiData;

  // retrieve metadata in a two-pass process
  const preMembers = Object.values(apiMembers).map((m) => processMember(m, year));
  const members = processAllMembers(preMembers, year);

  // TODO: remove debug log
  console.log(members);
  return members;
}

/**
 * computes leaderboard metadata for a single member
 *
 * @param member the raw `IApiMember` object
 * @param year the event year
 * @returns an `IPreMember` object holding additional metadata
 */
function processMember(member: IApiMember, year: number): IPreMember {
  const id = member.id;
  const name = member.name ?? `#${member.id}`;
  const active = member.last_star_ts !== 0;
  const finished = member.stars === 50;
  const total_stars = member.stars;
  const local_score = member.local_score;
  const global_score = member.global_score;

  // last star timestamp and duration
  const last_ts = active ? dayjs.unix(member.last_star_ts) : null;
  const last_time = last_ts ? dayjs.duration(last_ts.diff(unlockDate(year, 1))) : null;

  // transform completion timestamps, per day
  const parta_ts: IPreMember["parta_ts"] = {};
  const partb_ts: IPreMember["partb_ts"] = {};
  for (const day of ALL_DAYS) {
    const parts = member.completion_day_level[day];
    parta_ts[day] = parts && parts["1"] ? dayjs.unix(parts["1"].get_star_ts) : null;
    partb_ts[day] = parts && parts["2"] ? dayjs.unix(parts["2"].get_star_ts) : null;
  }

  // compute durations per part, per day
  const diff_duration = (day: number, ts: Dayjs | null) =>
    ts ? dayjs.duration(ts.diff(unlockDate(year, day))) : null;
  const parta_times = mapValues(parta_ts, diff_duration);
  const partb_times = mapValues(partb_ts, diff_duration);

  // number of completion times
  const parta_completed = dropNull(Object.values(parta_ts)).length;
  const partb_completed = dropNull(Object.values(partb_ts)).length;

  // number of stars, per day
  const sum_parts = (day: number) => (parta_ts[day] ? 1 : 0) + (partb_ts[day] ? 1 : 0);
  const stars = Object.fromEntries(ALL_DAYS.map((day) => [day, sum_parts(day)]));

  // delta times, per day (for days, where part 2 was done)
  const delta_times: IPreMember["delta_times"] = {};
  for (const day of ALL_DAYS) {
    const parta = parta_times[day];
    const partb = partb_times[day];
    delta_times[day] = parta && partb ? partb.subtract(parta) : null;
  }

  // median delta time
  const delta_ms = dropNull(Object.values(delta_times)).map((d) => d.asMilliseconds());
  const median_delta = delta_ms.length > 0 ? dayjs.duration(median(delta_ms)) : null;

  // total duration and delta time
  const sum_duration = (a: Duration, b: Duration) => a.add(b);
  const total_time = active
    ? dropNull(Object.values(partb_times)).reduce(sum_duration, dayjs.duration(0))
    : null;
  const total_delta = active
    ? dropNull(Object.values(delta_times)).reduce(sum_duration, dayjs.duration(0))
    : null;

  // average time it took to retrieve a star
  const time_per_star = total_time
    ? dayjs.duration(Math.floor(total_time.asMilliseconds() / total_stars))
    : null;

  return {
    id,
    name,
    active,
    finished,
    total_stars,
    stars,
    local_score,
    global_score,
    last_ts,
    last_time,
    parta_ts,
    partb_ts,
    parta_times,
    partb_times,
    parta_completed,
    partb_completed,
    delta_times,
    total_delta,
    median_delta,
    total_time,
    time_per_star,
  };
}

/**
 * computes leaderboard metadata for all members, in context of all members,
 * e.g. this is needed to compute ranks or other local scores
 *
 * @param members a list of all (including, `member`) preprocessed `IPreMember` objects
 * @param year the event year
 * @returns an `IMember` object holding the original metadata plus additional metadata
 */
function processAllMembers(members: IPreMember[], year: number): IMember[] {
  // attach new metadata
  const result = members.map((member) => {
    return {
      ...member,
      more: 1,
    };
  });

  return result;
}
