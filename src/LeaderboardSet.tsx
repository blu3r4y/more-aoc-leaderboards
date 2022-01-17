import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { IMember } from "./ApiProcessor";
import AppMasonry from "./AppMasonry";
import Leaderboard from "./Leaderboard";

dayjs.extend(duration);

declare interface ILeaderboardSetProps {
  members: IMember[];
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

/* leaderboards */

function getLocalLeaderboard(members: IMember[]) {
  const items = members.map((m) => ({ name: m.name, value: m.local_score }));

  return (
    <Leaderboard
      {...getLeaderboardProps("Local Leaderboard", "official scoring schema")}
      items={items}
    />
  );
}

function getPrimeCoders(members: IMember[]) {
  const items = members
    .filter((m) => m.finished && m.last_ts)
    .map((m) => ({
      name: m.name,
      value: m.last_ts!.format("MMM D HH:mm:ss"),
      rawValue: m.last_ts!.unix(),
      detailValue: m.last_ts!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps("Prime Coders", "first to complete all puzzles")}
      items={items}
      reverse
    />
  );
}

function getRapidCoders(members: IMember[]) {
  const items = members
    .filter((m) => m.finished && m.total_time)
    .map((m) => ({
      name: m.name,
      value:
        m.total_time!.asHours() < 24
          ? m.total_time!.format("HH:mm:ss")
          : `~${Math.floor(m.total_time!.asHours())}h`,
      rawValue: m.total_time!.asSeconds(),
      detailValue: m.total_time!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps("Rapid Coders", "total time spent on all days")}
      items={items}
      reverse
    />
  );
}

function getOverachievingAdapters(members: IMember[], minStars: number = 25) {
  const items = members
    .filter((m) => m.finished && m.total_delta)
    .map((m) => ({
      name: m.name,
      value:
        m.total_delta!.asHours() < 24
          ? m.total_delta!.format("HH:mm:ss")
          : `~${Math.floor(m.total_delta!.asHours())}h`,
      rawValue: m.total_delta!.asSeconds(),
      detailValue: m.total_delta!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Overachieving Adapters",
        `total time spent to finish the second part`
      )}
      items={items}
      reverse
    />
  );
}

function getSteadyPerformers(members: IMember[], minStars: number = 25) {
  const items = members
    .filter((m) => m.finished && m.median_delta)
    .map((m) => ({
      name: m.name,
      value:
        m.median_delta!.asHours() < 24
          ? m.median_delta!.format("HH:mm:ss")
          : `~${Math.floor(m.median_delta!.asHours())}h`,
      rawValue: m.median_delta!.asSeconds(),
      detailValue: m.median_delta!.format(),
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Steady Performers",
        `median time spent to finish the second part`
      )}
      items={items}
      reverse
    />
  );
}

function getStarEfficientCoders(members: IMember[], minStars: number = 25) {
  const items = members
    .filter((m) => m.total_stars >= minStars && m.time_per_star)
    .map((m) => ({
      name: m.name,
      value:
        m.time_per_star!.asHours() < 24
          ? `${m.time_per_star!.format("HH:mm:ss")} ★ ${m.total_stars}`
          : `~${Math.floor(m.time_per_star!.asHours())}h`,
      rawValue: m.time_per_star!.asSeconds(),
      detailValue: `${m.time_per_star!.format()} for ${m.total_stars} stars`,
    }));

  return (
    <Leaderboard
      {...getLeaderboardProps(
        "Star-Efficient Coders",
        `total time spent per star (for coders with at least ${minStars} stars)`
      )}
      items={items}
      reverse
    />
  );
}

function getEarlyBirds(members: IMember[], minStars: number = 25) {
  const items = members
    .filter((m) => m.parta_first)
    .map((m) => ({ name: m.name, value: m.parta_first }));

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

function getEarlyOwls(members: IMember[], minStars: number = 25) {
  const items = members
    .filter((m) => m.partb_first)
    .map((m) => ({ name: m.name, value: m.partb_first }));

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

function getSleepyArchitects(members: IMember[], minStars: number = 25) {
  const items = members
    .filter((m) => m.day_first)
    .map((m) => ({ name: m.name, value: m.day_first }));

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
