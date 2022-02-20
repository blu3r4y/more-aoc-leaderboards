import { useMemo } from "react";

import "./Snow.scss";

declare interface ISnowProps {
  count: number;
}

function Snow(props: ISnowProps) {
  // ensure that count is not larger than the value in Snow.scss
  const { count } = props;

  const snowflakes = useMemo(() => {
    const flakes = [];
    for (let i = 1; i <= count; i++) {
      flakes.push(<div key={`flake${i}`} className="Snowflake" />);
    }
    return flakes;
  }, [count]);

  return <div className="Snow">{snowflakes}</div>;
}

export default Snow;
