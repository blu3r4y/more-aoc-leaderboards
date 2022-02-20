import dayjs from "dayjs";
import duration, { Duration } from "dayjs/plugin/duration";

import { IProcessedData } from "../api/ApiProcessor";
import AppMasonry from "./AppMasonry";
import Leaderboard from "./Leaderboard";

dayjs.extend(duration);

declare interface ILeaderboardSetProps {
  members: IProcessedData;
}

function LeaderboardSet(props: ILeaderboardSetProps) {
  const { members } = props;

  return (
    <AppMasonry>
      {[
        getLocalLeaderboard(members),
        getPrimeCoders(members),
        getRapidCoders(members),
        getOverachievingAdapters(members),
        getSteadyPerformers(members),
        getStarEfficientCoders(members),
        getEarlyBirds(members),
        getEarlyOwls(members),
        getSleepyArchitects(members),
      ]}
    </AppMasonry>
  );
}

function getLeaderboardProps(title: string, description: string, limit: number = 10) {
  const key = title.toLowerCase().replace(/ /g, "-");
  return { key, title, description, limit };
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

  return (
    <Leaderboard
      {...getLeaderboardProps("Local Leaderboard", "official scoring schema")}
      items={items}
    />
  );
}

function getPrimeCoders(members: IProcessedData) {
  const items = Object.values(members)
    .filter((m) => m.finished && m.lastTimestamp)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: m.lastTimestamp!.format("MMM D HH:mm:ss"),
      rawValue: m.lastTimestamp!.unix(),
      detailValue: m.lastTimestamp!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps("Prime Coders", "first to get 50 stars")}
      items={items}
      reverse
    />
  );
}

function getRapidCoders(members: IProcessedData) {
  const items = Object.values(members)
    .filter((m) => m.finished && m.totalTime)
    .map((m) => ({
      id: m.id,
      name: m.name,
      value: formatDuration(m.totalTime!),
      rawValue: m.totalTime!.asSeconds(),
      detailValue: m.totalTime!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps("Rapid Coders", "total time spent to get 50 stars")}
      items={items}
      reverse
    />
  );
}

function getOverachievingAdapters(members: IProcessedData, minStars: number = 25) {
  const items = Object.values(members)
    .filter((m) => m.finished && m.totalDelta)
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
        `total time spent to finish the second part of all 25 puzzles`
      )}
      items={items}
      reverse
    />
  );
}

function getSteadyPerformers(members: IProcessedData, minStars: number = 25) {
  const items = Object.values(members)
    .filter((m) => m.finished && m.medianDelta)
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
        `median time spent to finish the second part of all 25 puzzles`
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
        `total time spent per star, for coders with at least ${minStars} stars`
      )}
      items={items}
      reverse
    />
  );
}

function getEarlyBirds(members: IProcessedData, minStars: number = 25) {
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

function getEarlyOwls(members: IProcessedData, minStars: number = 25) {
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

function getSleepyArchitects(members: IProcessedData, minStars: number = 25) {
  const items = Object.values(members)
    .filter((m) => m.dayFirst)
    .map((m) => ({ id: m.id, name: m.name, value: m.dayFirst }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Sleepy Architects",
        `number of times to get both parts finished first`
      )}
      items={items}
    />
  );
}

export default LeaderboardSet;
