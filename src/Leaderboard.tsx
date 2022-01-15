import { useMemo } from "react";

import "./Leaderboard.css";

declare interface LeaderboardProps {
  items: { name: string; score: number }[];
  title?: string;
  sort?: boolean;
  limit?: number;
}

function Leaderboard(props: LeaderboardProps) {
  const { items, title, sort, limit } = props;

  const rows = useMemo(() => {
    // sort the items unless avoided
    const values = sort ? items.sort((a, b) => b.score - a.score) : items;

    const result = [];
    let scorePre = null;
    let rankDelta = 0;

    // prepare entries
    for (const [rank, element] of values.entries()) {
      // adjust rank if scores are equal
      rankDelta = scorePre !== null && scorePre === element.score ? rankDelta + 1 : 0;
      const displayRank = rankDelta > 0 ? "." : rank + 1;

      result.push(
        <tr key={rank} data-rank={rank + 1 - rankDelta}>
          <td className="Rank">{displayRank}</td>
          <td className="Name">{element.name}</td>
          <td className="Value">{formatScore(element.score)}</td>
        </tr>
      );

      scorePre = element.score;
    }

    return result;
  }, [items, sort]);

  return (
    <div className="Leaderboard">
      <div>{title}</div>
      <table>
        <tbody>{rows.slice(0, limit)}</tbody>
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
