import { IApiData } from "./ApiTypes";
import AppMasonry from "./AppMasonry";
import Leaderboard from "./Leaderboard";

declare interface LeaderboardSetProps {
  apiData: IApiData;
}

function LeaderboardSet(props: LeaderboardSetProps) {
  const board = [];

  // render local score board
  for (const member of Object.values(props.apiData.members)) {
    board.push({
      name: member.name ?? `#${member.id}`,
      score: member.local_score,
    });
  }

  return (
    <AppMasonry>
      <Leaderboard title="Local Leaderboard" items={board} limit={10} sort />
    </AppMasonry>
  );
}

export default LeaderboardSet;
