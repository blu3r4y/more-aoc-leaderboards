import dayjs, { Dayjs } from "dayjs";
import duration, { Duration } from "dayjs/plugin/duration";

import { IApiData, IApiMember } from "./ApiTypes";
import { mapValues, dropNull, median, rankIndexes } from "../utils/Utils";

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
  totalStars: number;
  /** stars, per day */
  stars: { [day: number]: number };
  /** score on the local leaderboard */
  localScore: number;
  /** score on the global leaderboard */
  globalScore: number;
  /** timestamp when the last star was retrieved */
  lastTimestamp: Dayjs | null;
  /** duration from day 1 until the last star was retrieved */
  lastTime: Duration | null;
  /** timestamp when part 1 was completed, per day */
  partaTimestamp: { [day: number]: Dayjs | null };
  /** timestamp when part 2 was completed, per day */
  partbTimestamp: { [day: number]: Dayjs | null };
  /** duration from unlock to completion of part 1, per day */
  partaTimes: { [day: number]: Duration | null };
  /** duration from unlock to completion of part 2, per day */
  partbTimes: { [day: number]: Duration | null };
  /** number of times part 1 was completed */
  partaCompleted: number;
  /** number of times part 2 was completed */
  partbCompleted: number;
  /** delta time between part 1 and 2, per day */
  deltaTimes: { [day: number]: Duration | null };
  /** total delta time */
  totalDelta: Duration | null;
  /** median delta time */
  medianDelta: Duration | null;
  /** total duration to complete both parts of a day */
  totalTime: Duration | null;
  /** average duration it took to retrieve one star */
  timePerStar: Duration | null;
}

export declare type IProcessedData = { [id: number]: IMember };

export declare interface IMember extends IPreMember {
  /** points, per day */
  points: { [day: number]: number };
  /** points for part 1, per day */
  partaPoints: { [day: number]: number };
  /** points for part 2, per day */
  partbPoints: { [day: number]: number };
  /** ranks for part 1, per day */
  partaRanks: { [day: number]: number | null };
  /** ranks for part 2, per day */
  partbRanks: { [day: number]: number | null };
  /** ranks for delta time, per day */
  deltaRanks: { [day: number]: number | null };
  /** number of times part 1 was completed with rank 1 */
  partaFirst: number;
  /** number of times part 2 was completed with rank 1 */
  partbFirst: number;
  /** number of times part 1 & part 2 was completed with rank 1 */
  dayFirst: number;
}

const ALL_DAYS = Array.from(new Array(25), (_, i) => i + 1);

function unlockDate(year: number, day: number): Dayjs {
  return dayjs(`${year}-12-${day.toString().padStart(2, "0")}T05:00:00.000Z`);
}

function isOutageDay(year: number, day: number): boolean {
  return (year === 2018 && day === 6) || (year === 2020 && day === 1);
}

export function processData(apiData: IApiData): IProcessedData {
  const { event: year, members: apiMembers } = apiData;

  // retrieve metadata for each individual member
  const preMembers = Object.fromEntries(
    Object.values(apiMembers).map((m) => [m.id, processMember(m, year)])
  );

  // retrieve (rank-based) metadata for all members
  const members = processAllMembers(preMembers, year);

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
  const totalStars = member.stars;
  const localScore = member.local_score;
  const globalScore = member.global_score;

  // last star timestamp and duration
  const lastTimestamp = active ? dayjs.unix(member.last_star_ts) : null;
  const lastTime = lastTimestamp
    ? dayjs.duration(lastTimestamp.diff(unlockDate(year, 1)))
    : null;

  // transform completion timestamps, per day
  const partaTimestamp: IPreMember["partaTimestamp"] = {};
  const partbTimestamp: IPreMember["partbTimestamp"] = {};
  for (const day of ALL_DAYS) {
    const p = member.completion_day_level[day];
    partaTimestamp[day] = p && p["1"] ? dayjs.unix(p["1"].get_star_ts) : null;
    partbTimestamp[day] = p && p["2"] ? dayjs.unix(p["2"].get_star_ts) : null;
  }

  // compute durations per part, per day
  const diffDuration = (day: number, ts: Dayjs | null) =>
    ts ? dayjs.duration(ts.diff(unlockDate(year, day))) : null;
  const partaTimes = mapValues(partaTimestamp, diffDuration);
  const partbTimes = mapValues(partbTimestamp, diffDuration);

  // number of completion times
  const partaCompleted = dropNull(Object.values(partaTimestamp)).length;
  const partbCompleted = dropNull(Object.values(partbTimestamp)).length;

  // number of stars, per day
  const sumParts = (day: number) =>
    (partaTimestamp[day] ? 1 : 0) + (partbTimestamp[day] ? 1 : 0);
  const stars = Object.fromEntries(ALL_DAYS.map((day) => [day, sumParts(day)]));

  // delta times, per day (for days, where part 2 was done)
  const deltaTimes: IPreMember["deltaTimes"] = {};
  for (const day of ALL_DAYS) {
    const parta = partaTimes[day];
    const partb = partbTimes[day];
    deltaTimes[day] = parta && partb ? partb.subtract(parta) : null;
  }

  // median delta time
  const deltaMs = dropNull(Object.values(deltaTimes)).map((d) => d.asMilliseconds());
  const medianDelta = deltaMs.length > 0 ? dayjs.duration(median(deltaMs)) : null;

  // total delta time
  const sumDuration = (a: Duration, b: Duration) => a.add(b);
  const totalDelta = active
    ? dropNull(Object.values(deltaTimes)).reduce(sumDuration, dayjs.duration(0))
    : null;

  // total duration
  const latestPartTime = (day: number) => {
    if (partbTimes[day]) return partbTimes[day];
    if (partaTimes[day]) return partaTimes[day];
    return null;
  };
  const totalTime = active
    ? dropNull(ALL_DAYS.map(latestPartTime)).reduce(sumDuration, dayjs.duration(0))
    : null;

  // average time it took to retrieve a star
  const timePerStar = totalTime
    ? dayjs.duration(Math.floor(totalTime.asMilliseconds() / totalStars))
    : null;

  return {
    id,
    name,
    active,
    finished,
    totalStars,
    stars,
    localScore,
    globalScore,
    lastTimestamp,
    lastTime,
    partaTimestamp,
    partbTimestamp,
    partaTimes,
    partbTimes,
    partaCompleted,
    partbCompleted,
    deltaTimes,
    totalDelta,
    medianDelta,
    totalTime,
    timePerStar,
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
function processAllMembers(
  members: { [id: number]: IPreMember },
  year: number
): IProcessedData {
  const numMembers = Object.keys(members).length;

  // initialize a map, that, for each member id, maps a metric of that day, per metric
  type IMemberDayMetricMap<T> = { [id: number]: { [day: number]: number | T } };
  const newDayMetricMap: <T>(init: T) => { [day: number]: number | T } = <T>(init: T) =>
    Object.fromEntries(ALL_DAYS.map((day) => [day, init]));
  const newMemberDayMetricMap: <T>(init: T) => IMemberDayMetricMap<T> = <T>(init: T) =>
    mapValues(members, () => newDayMetricMap(init));

  // ... for points
  const points = newMemberDayMetricMap(0);
  const partaPoints = newMemberDayMetricMap(0);
  const partbPoints = newMemberDayMetricMap(0);

  // ... for ranks
  const partaRanks = newMemberDayMetricMap<number | null>(null);
  const partbRanks = newMemberDayMetricMap<number | null>(null);
  const deltaRanks = newMemberDayMetricMap<number | null>(null);

  // compute day-wise metrics
  type IBoardEle = { id: number; time: Duration };
  for (const day of ALL_DAYS) {
    const [allParta, allPartb, allDelta]: IBoardEle[][] = [[], [], []];

    // fill data store with values from all members
    for (const m of Object.values(members)) {
      if (m.partaTimes[day]) allParta.push({ id: m.id, time: m.partaTimes[day]! });
      if (m.partbTimes[day]) allPartb.push({ id: m.id, time: m.partbTimes[day]! });
      if (m.deltaTimes[day]) allDelta.push({ id: m.id, time: m.deltaTimes[day]! });
    }

    // sort time-based board metrics (break ties by user id)
    const sortDuration = (a: IBoardEle, b: IBoardEle) => {
      const delta = a.time.subtract(b.time).asSeconds();
      return delta !== 0 ? delta : a.id - b.id;
    };

    allParta.sort(sortDuration);
    allPartb.sort(sortDuration);
    allDelta.sort(sortDuration);

    // assign true rank values to individual members
    const selectTime = (e: IBoardEle) => e.time.asSeconds();
    const assignRanks =
      (obj: IMemberDayMetricMap<number | null>) =>
      (it: [rank: number, ele: IBoardEle]) =>
        (obj[it[1].id][day] = it[0]);
    rankIndexes(allParta, { key: selectTime }).forEach(assignRanks(partaRanks));
    rankIndexes(allPartb, { key: selectTime }).forEach(assignRanks(partbRanks));
    rankIndexes(allDelta, { key: selectTime }).forEach(assignRanks(deltaRanks));

    // do not compute points for outage days
    if (!isOutageDay(year, day)) {
      // compute points per parts (based on sorted part times)
      const computePoints =
        (obj: IMemberDayMetricMap<number | null>) => (ele: IBoardEle, index: number) =>
          (obj[ele.id][day] = numMembers - index);
      allParta.forEach(computePoints(partaPoints));
      allPartb.forEach(computePoints(partbPoints));
    }

    // sum points for both parts, for that day
    Object.values(members).forEach(
      (m) => (points[m.id][day] = partaPoints[m.id][day] + partbPoints[m.id][day])
    );
  }

  // attach new metadata, per member
  // and compute some further overall statistics
  const result = mapValues(members, (id: number, m: IPreMember) => {
    // assert that we computed the points correctly
    const score = Object.values(points[m.id]).reduce((a, b) => a + b, 0);
    console.assert(
      score === m.localScore,
      `score computation yielded wrong score ${score} (expected ${m.localScore}) for ${m.name}`
    );

    // how often did the member finish part 1 or 2 first?
    const partaFirst = Object.values(partaRanks[m.id]).filter((r) => r === 1).length;
    const partbFirst = Object.values(partbRanks[m.id]).filter((r) => r === 1).length;

    // ... or both parts of a day?
    const dayFirst = ALL_DAYS.filter(
      (day) => partaRanks[m.id][day] === 1 && partbRanks[m.id][day] === 1
    ).length;

    return {
      ...m,
      points: points[m.id],
      partaPoints: partaPoints[m.id],
      partbPoints: partbPoints[m.id],
      partaRanks: partaRanks[m.id],
      partbRanks: partbRanks[m.id],
      deltaRanks: deltaRanks[m.id],
      partaFirst: partaFirst,
      partbFirst: partbFirst,
      dayFirst: dayFirst,
    };
  });

  return result;
}
