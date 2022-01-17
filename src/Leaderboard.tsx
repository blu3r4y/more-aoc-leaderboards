import { useMemo } from "react";

import "./Leaderboard.css";

export declare interface ILeaderboardRow {
  /** the name of the member to represent */
  name: string;
  /** the value to display */
  value: string | number;
  /** (optional) raw value, by which sorting should happen */
  rawValue?: number;
  /** (optional) a detailed value that is presented when one hovers over the value */
  detailValue?: string | number;
}

declare interface ILeaderboardProps {
  items: ILeaderboardRow[];
  title?: string;
  description?: string;
  limit?: number;
  unsorted?: boolean;
  reverse?: boolean;
}

function Leaderboard(props: ILeaderboardProps) {
  const { items, title, description, limit, unsorted, reverse } = props;

  const rows = useMemo(() => {
    // sort and possibly reverse values
    let values = [...items];
    if (!unsorted) values.sort(sortValues);
    if (reverse) values.reverse();

    const result = [];
    let scorePre = null;
    let rankDelta = 0;

    // prepare entries
    for (const [rank, element] of values.entries()) {
      // adjust rank if scores are equal
      const score = element.rawValue ?? element.value;
      rankDelta = scorePre !== null && scorePre === score ? rankDelta + 1 : 0;
      const displayRank = rankDelta > 0 ? "." : rank + 1;

      result.push(
        <tr key={rank} data-rank={rank + 1 - rankDelta}>
          <td className="Rank">{displayRank}</td>
          <td className="Name" title={element.name}>
            {element.name}
          </td>
          <td
            className="Value"
            title={element.detailValue?.toString()}
            data-raw={element.rawValue}
          >
            {formatScore(element.value)}
          </td>
        </tr>
      );

      scorePre = element.value;
    }

    return result;
  }, [items, unsorted, reverse]);

  return (
    <div className="Leaderboard">
      <div className="Title">{title}</div>
      <div className="Description">{description}</div>
      <table>
        <tbody>{rows.slice(0, limit)}</tbody>
      </table>
    </div>
  );
}

function sortValues(a: ILeaderboardRow, b: ILeaderboardRow) {
  // sort by raw value if available, fall-back to value
  if (a.rawValue && b.rawValue) return b.rawValue - a.rawValue;
  else return Number(b.value) - Number(a.value);
}

function formatScore(x: string | number): string {
  // add a thousand separator to numbers
  // (c) https://stackoverflow.com/a/2901298/927377
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Leaderboard;
