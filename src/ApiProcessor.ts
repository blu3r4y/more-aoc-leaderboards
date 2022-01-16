import { median } from "mathjs";
import dayjs, { Dayjs } from "dayjs";
import duration, { Duration } from "dayjs/plugin/duration";

import { IApiData, IApiMember } from "./ApiTypes";
import { mapValues } from "./Utils";

dayjs.extend(duration);

export declare interface IMember extends IPreMember {
  more: number;
}

declare interface IPreMember {
  /** name of the member, or its id otherwise */
  name: string;
  /** whether this user did any puzzles */
  active: boolean;
  /** total number of stars */
  stars: number;
  /** score on the local leaderboard */
  local_score: number;
  /** timestamp when the last star was retrieved */
  last_ts: Dayjs | null;
  /** duration from day 1 until the last star was retrieved */
  last_time: Duration | null;
  /** timestamp when part 1 was completed, per day */
  parta_ts: { [day: number]: Dayjs };
  /** timestamp when part 2 was completed, per day */
  partb_ts: { [day: number]: Dayjs };
  /** duration from unlock to completion of part 1, per day */
  parta_times: { [day: number]: Duration };
  /** duration from unlock to completion of part 2, per day */
  partb_times: { [day: number]: Duration };
  /** number of times part 1 was completed */
  parta_finish: number;
  /** number of times part 2 was completed */
  partb_finish: number;
  /** delta time between part 1 and 2, per day */
  delta_times: { [day: number]: Duration };
  /** total delta time */
  total_delta: Duration | null;
  /** median delta time */
  median_delta: Duration | null;
  /** total duration to complete both parts of a day */
  total_time: Duration;
}

export function processData(apiData: IApiData | null): IMember[] | null {
  if (!apiData) return null;

  const { event: year, members: apiMembers } = apiData;

  // retrieve metadata in a two-pass process
  const preMembers = Object.values(apiMembers).map((m) => preprocessMember(m, year));
  const members = preMembers.map((m) => processMember(m, preMembers, year));

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
function preprocessMember(member: IApiMember, year: number): IPreMember {
  const name = member.name ?? `#${member.id}`;
  const active = member.last_star_ts !== 0;
  const stars = member.stars;
  const local_score = member.local_score;

  // last star timestamp and duration
  const last_ts = active ? dayjs.unix(member.last_star_ts) : null;
  const last_time = last_ts ? dayjs.duration(last_ts.diff(unlockDate(year, 1))) : null;

  // transform completion timestamps, per day
  const parta_ts: IPreMember["parta_ts"] = {};
  const partb_ts: IPreMember["partb_ts"] = {};
  for (const [day, parts] of Object.entries(member.completion_day_level)) {
    const dayn = day as any as number;
    if (parts["1"]) parta_ts[dayn] = dayjs.unix(parts["1"].get_star_ts);
    if (parts["2"]) partb_ts[dayn] = dayjs.unix(parts["2"].get_star_ts);
  }

  // compute durations per part, per day
  const duration_difference = (day: number, ts: Dayjs) =>
    dayjs.duration(ts.diff(unlockDate(year, day)));
  const parta_times = mapValues(parta_ts, duration_difference);
  const partb_times = mapValues(partb_ts, duration_difference);

  // number of completion times
  const parta_finish = Object.keys(parta_ts).length;
  const partb_finish = Object.keys(partb_ts).length;

  // delta times, per day (for days, where part 2 was done)
  const delta_times: IPreMember["delta_times"] = {};
  for (const day of Object.keys(partb_times)) {
    const dayn = day as any as number;
    delta_times[dayn] = partb_times[dayn].subtract(parta_times[dayn]);
  }

  // median delta time
  const delta_ms = Object.values(delta_times).map((d) => d.asMilliseconds());
  const median_delta = delta_ms.length > 0 ? dayjs.duration(median(delta_ms)) : null;

  // total duration and delta time
  const duration_sum = (a: Duration, b: Duration) => a.add(b);
  const total_time = Object.values(partb_times).reduce(duration_sum, dayjs.duration(0));
  const total_delta = active
    ? Object.values(delta_times).reduce(duration_sum, dayjs.duration(0))
    : null;

  return {
    name,
    active,
    stars,
    local_score,
    last_ts,
    last_time,
    parta_ts,
    partb_ts,
    parta_times,
    partb_times,
    parta_finish,
    partb_finish,
    delta_times,
    total_delta,
    median_delta,
    total_time,
  };
}

/**
 * computes leaderboard metadata for a member, in context of all members
 *
 * @param member a preprocessed `IPreMember` object
 * @param members a list of all (including, `member`) preprocessed `IPreMember` objects
 * @param year the event year
 * @returns an `IMember` object holding the original metadata plus additional metadata
 */
function processMember(
  member: IPreMember,
  members: IPreMember[],
  year: number
): IMember {
  // TODO: implement
  return { ...member, more: 1 };
}

const unlockDate = (year: number, day: number) =>
  dayjs(`${year}-12-${day.toString().padStart(2, "0")}T05:00:00.000Z`);
