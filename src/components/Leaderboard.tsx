import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp as faUp,
  faChevronDown as faDown,
} from "@fortawesome/free-solid-svg-icons";

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
  help?: string;
  unsorted?: boolean;
  reverse?: boolean;
}

/* number of items to show initially */
const LIMIT_MIN: number = 10;
/* step size of the expand button */
const LIMIT_STEP: number = 100;

function Leaderboard(props: ILeaderboardProps) {
  const { items, title, description, help, unsorted, reverse } = props;

  // number of items that are currently shown
  const [limit, setLimit] = useState<number>(LIMIT_MIN);

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

  const canExpand = rows.length > limit;
  const canContract = Math.min(limit, rows.length) > LIMIT_MIN;

  const expandTable = () => setLimit(Math.min(rows.length, limit + LIMIT_STEP));
  const contractTable = () => setLimit(Math.max(LIMIT_MIN, limit - LIMIT_STEP));

  const chevronIcons = (
    <div className="ChevronIcons">
      {canExpand ? <FontAwesomeIcon onClick={expandTable} icon={faDown} /> : null}
      {canContract ? <FontAwesomeIcon onClick={contractTable} icon={faUp} /> : null}
    </div>
  );

  const emptyMessage = <div className="Empty">- no players -</div>;
  const table = (
    <table>
      <tbody>{rows.slice(0, limit)}</tbody>
    </table>
  );

  return (
    <div className="Leaderboard">
      <div className="Title">{title}</div>
      <div className="Description" title={help}>
        {description}
      </div>
      {rows.length > 0 ? table : emptyMessage}
      {chevronIcons}
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
