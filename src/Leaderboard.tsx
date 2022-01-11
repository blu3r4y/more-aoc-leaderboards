import "./Leaderboard.css";

declare interface LeaderboardProps {
  title?: string;
  noSort?: boolean;
  items: { name: string; score: number }[];
}

function Leaderboard(props: LeaderboardProps) {
  // sort the items unless avoided
  const items = props.noSort
    ? props.items
    : props.items.sort((a, b) => b.score - a.score);

  const rows = [];
  let scorePre = null;
  let rankDelta = 0;

  // prepare entries
  for (const [rank, element] of items.entries()) {
    // adjust rank if scores are equal
    rankDelta = scorePre !== null && scorePre === element.score ? rankDelta + 1 : 0;
    const displayRank = rankDelta > 0 ? "." : rank + 1;

    rows.push(
      <tr key={rank} data-rank={rank + 1 - rankDelta}>
        <td className="Rank">{displayRank}</td>
        <td className="Name">{element.name}</td>
        <td className="Value">{formatScore(element.score)}</td>
      </tr>
    );

    scorePre = element.score;
  }

  return (
    <div className="Leaderboard">
      <div>{props.title}</div>
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

function formatScore(x: number): string {
  // add a thousand separator to numbers
  // (c) https://stackoverflow.com/a/2901298/927377
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Leaderboard;
