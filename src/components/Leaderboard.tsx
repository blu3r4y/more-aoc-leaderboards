import { useMemo } from "react";

import { rankIndexes } from "../utils/Utils";

import "./Leaderboard.css";

export declare interface ILeaderboardRow {
  /** the id of the member to represent */
  id: number;
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

    // prepare entries
    const result = [];
    const ranked = rankIndexes(values, { key: (e) => e.rawValue ?? e.value });
    for (const [i, [rank, element]] of ranked.entries()) {
      result.push(
        <tr key={i} data-rank={rank} data-id={element.id}>
          <td className="Rank">{rank}</td>
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
  const avalue = a.rawValue ?? Number(a.value);
  const bvalue = b.rawValue ?? Number(b.value);

  // sort by user id (ascending order), if values are equal
  if (avalue === bvalue) return a.id - b.id;

  // sort in descending order
  return bvalue - avalue;
}

function formatScore(x: string | number): string {
  // add a thousand separator to numbers
  // (c) https://stackoverflow.com/a/2901298/927377
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Leaderboard;
