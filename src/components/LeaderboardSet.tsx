import dayjs from "dayjs";
import duration, { Duration } from "dayjs/plugin/duration";

import { IProcessedData } from "../api/ApiProcessor";
import { achievableStars } from "../utils/StarUtils";
import AppMasonry from "./AppMasonry";
import Leaderboard from "./Leaderboard";

dayjs.extend(duration);

declare interface ILeaderboardSetProps {
  members: IProcessedData;
}

function LeaderboardSet(props: ILeaderboardSetProps) {
  const { members } = props;

  // maximum number of stars that can be achieved right now
  // TODO: if anyone achieved more, the clients local time is off, fix that?
  const year = Object.values(members)[0].year || dayjs().year();
  const maxStars = achievableStars(dayjs(), year);

  return (
    <AppMasonry>
      {[
        getLocalLeaderboard(members),
        getPrimeCoders(members, maxStars),
        getLateBloomers(members),
        getRapidCoders(members, maxStars),
        getOverachievingAdapters(members, ~~(maxStars / 2)),
        getSteadyPerformers(members, ~~(maxStars / 2)),
        getStarEfficientCoders(members, Math.min(25, maxStars)),
        getSpeedRunners(members),
        getEarlyBirds(members),
        getEarlyOwls(members),
        getTopBirds(members),
        getStarCollectors(members),
        getFastMinimalists(members),
        getFastPerfectionists(members),
        getGlobalLeaderboard(members),
      ]}
    </AppMasonry>
  );
}

function getLeaderboardProps(title: string, description?: string, help?: string) {
  const key = title.toLowerCase().replace(/ /g, "-");
  return { key, title, description, help };
}

function formatDuration(duration: Duration) {
  if (duration.asHours() < 24) return duration.format("HH:mm:ss");
  if (duration.asHours() < 24 * 365) return `~${Math.floor(duration.asHours())}h`;
  return `~${Math.floor(duration.asYears())}y`;
}

/* leaderboards */

function getLocalLeaderboard(members: IProcessedData) {
  const items = Object.values(members).map((m) => ({
    id: m.id,
    name: m.name,
    value: m.localScore,
  }));

  const numMembers = Object.keys(members).length;

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Local Leaderboard",
        "official scoring schema",
        `there are ${numMembers} coders on this leaderboard.\n` +
          `getting a star first is worth ${numMembers} points, ` +
          `second is worth ${numMembers - 1} points, ` +
          `third ${numMembers - 2} and so on ...`
      )}
      items={items}
    />
  );
}

function getGlobalLeaderboard(members: IProcessedData) {
  const items = Object.values(members)
    .filter((m) => m.globalScore > 0)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: m.globalScore,
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Global Leaderboard",
        "official global scoring schema",
        "same as with the local leaderboard score, but only the first 100 coders get points"
      )}
      items={items}
    />
  );
}

function getStarCollectors(members: IProcessedData) {
  const items = Object.values(members).map((m) => ({
    id: m.id,
    name: m.name,
    value: `★ ${m.totalStars}`,
    rawValue: m.totalStars,
  }));

  return (
    <Leaderboard
      {...getLeaderboardProps("Star Collectors", "number of stars earned")}
      items={items}
    />
  );
}

function getPrimeCoders(members: IProcessedData, numStars: number = 50) {
  const items = Object.values(members)
    .filter((m) => m.totalStars === numStars && m.lastTimestamp)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: m.lastTimestamp!.format("MMM D HH:mm:ss"),
      rawValue: m.lastTimestamp!.unix(),
      detailValue: m.lastTimestamp!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Prime Coders",
        `first to get ${numStars} stars`,
        `the date indicates the moment when the ${numStars}th star was earned`
      )}
      items={items}
      reverse
    />
  );
}

function getRapidCoders(members: IProcessedData, numStars: number = 50) {
  const items = Object.values(members)
    .filter((m) => m.totalStars === numStars && m.totalTime)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: formatDuration(m.totalTime!),
      rawValue: m.totalTime!.asSeconds(),
      detailValue: m.totalTime!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Rapid Coders",
        `time spent to get ${numStars} stars`,
        "sum of the duration it took to complete the second part of each day.\n" +
          "the duration (per day) is measured from the moment when a puzzle was released, " +
          "until the second part of that puzzle was finished."
      )}
      items={items}
      reverse
    />
  );
}

function getOverachievingAdapters(members: IProcessedData, numDays: number = 25) {
  const items = Object.values(members)
    .filter((m) => m.totalStars === 2 * numDays && m.totalDelta)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: formatDuration(m.totalDelta!),
      rawValue: m.totalDelta!.asSeconds(),
      detailValue: m.totalDelta!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Overachieving Adapters",
        `delta time between the first and second part of all ${numDays} puzzles`,
        "sum of the delta times of each day.\n" +
          "the delta time (per day) is measured from the moment the first part of a day was finished, " +
          "until the second part was finished."
      )}
      items={items}
      reverse
    />
  );
}

function getSteadyPerformers(members: IProcessedData, numDays: number = 25) {
  const items = Object.values(members)
    .filter((m) => m.totalStars === 2 * numDays && m.medianDelta)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: formatDuration(m.medianDelta!),
      rawValue: m.medianDelta!.asSeconds(),
      detailValue: m.medianDelta!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Steady Performers",
        `median delta time between the first and second part of all ${numDays} puzzles`,
        "median of the delta times of each day.\n" +
          "the delta time (per day) is measured from the moment the first part of a day was finished, " +
          "until the second part was finished."
      )}
      items={items}
      reverse
    />
  );
}

function getStarEfficientCoders(members: IProcessedData, minStars: number = 25) {
  const items = Object.values(members)
    .filter((m) => m.totalStars >= minStars && m.timePerStar)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: `${formatDuration(m.timePerStar!)} ★ ${m.totalStars}`,
      rawValue: m.timePerStar!.asSeconds(),
      detailValue: `${m.timePerStar!.format()} for ${m.totalStars} stars`,
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Star-Efficient Coders",
        `time spent per star, for coders with at least ${minStars} stars`,
        `for coders with at least ${minStars} stars, the duration you get by dividing " +
        "the time spent to earn them (see "Rapid Coders") by the number of stars earned`
      )}
      items={items}
      reverse
    />
  );
}

function getEarlyBirds(members: IProcessedData) {
  const items = Object.values(members)
    .filter((m) => m.partaFirst)
    .map((m) => ({ id: m.id, name: m.name, value: m.partaFirst }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Early Birds",
        `number of times to get the first part finished first`
      )}
      items={items}
    />
  );
}

function getEarlyOwls(members: IProcessedData) {
  const items = Object.values(members)
    .filter((m) => m.partbFirst)
    .map((m) => ({ id: m.id, name: m.name, value: m.partbFirst }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Early Owls",
        `number of times to get the second part finished first`
      )}
      items={items}
    />
  );
}

function getSpeedRunners(members: IProcessedData) {
  const items = Object.values(members)
    .filter((m) => m.dayFirst)
    .map((m) => ({ id: m.id, name: m.name, value: m.dayFirst }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Speed Runners",
        `number of times to get both parts of a puzzle finished first`,
        "coders that finish the first and second part of the same day first"
      )}
      items={items}
    />
  );
}

function getFastMinimalists(members: IProcessedData) {
  const items = Object.values(members).map((m) => ({
    id: m.id,
    name: m.name,
    value: m.partaScore,
  }));

  return (
    <Leaderboard
      {...getLeaderboardProps("Fast Minimalists", `points from the first part only`)}
      items={items}
    />
  );
}

function getFastPerfectionists(members: IProcessedData) {
  const items = Object.values(members).map((m) => ({
    id: m.id,
    name: m.name,
    value: m.partbScore,
  }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Fast Perfectionists",
        `points from the second part only`
      )}
      items={items}
    />
  );
}

function getLateBloomers(members: IProcessedData) {
  const items = Object.values(members)
    .filter((m) => m.active)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: m.lastTimestamp!.format("MMM D HH:mm:ss"),
      rawValue: m.lastTimestamp!.unix(),
      detailValue: m.lastTimestamp!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps("Late Bloomers", `most recent star earned`)}
      items={items}
    />
  );
}

function getTopBirds(members: IProcessedData, minRank: number = 3) {
  const items = Object.values(members)
    .filter((m) => m.partbMinRankCount[minRank] > 0)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: m.partbMinRankCount[minRank],
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Top Birds",
        `number of times to get the puzzle finished among the first ${minRank} coders`,
        "for every day that you finish the second part of a puzzle on the podium " +
          "(i.e, as the first, the second, or the third coder), this adds one point for you"
      )}
      items={items}
    />
  );
}

export default LeaderboardSet;
