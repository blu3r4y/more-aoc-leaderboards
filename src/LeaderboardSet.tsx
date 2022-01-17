import { IMember } from "./ApiProcessor";
import AppMasonry from "./AppMasonry";
import Leaderboard from "./Leaderboard";

declare interface ILeaderboardSetProps {
  members: IMember[];
}

function LeaderboardSet(props: ILeaderboardSetProps) {
  const board = [];

  // render local score board
  for (const member of Object.values(props.members)) {
    board.push({
      name: member.name,
      value: member.local_score,
    });
  }

  return (
    <AppMasonry>
      <Leaderboard
        title="Local Leaderboard"
        description="official scoring schema"
        items={board}
        limit={10}
      />
    </AppMasonry>
  );
}

export default LeaderboardSet;
