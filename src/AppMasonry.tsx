import Masonry from "react-masonry-css";

import "./AppMasonry.css";

function AppMasonry(props: any) {
  const masonryBreakpoints = {
    default: 6,
    2500: 5,
    2000: 4,
    1500: 3,
    1000: 2,
    500: 1,
  };

  return (
    <Masonry
      breakpointCols={masonryBreakpoints}
      className="AppMasonry"
      columnClassName="AppMasonryColumn"
    >
      {props.children}
    </Masonry>
  );
}

export default AppMasonry;
