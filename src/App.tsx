import { useCallback, useState } from "react";

import { IApiData } from "./ApiTypes";
import JsonDropzone from "./JsonDropzone";
import LeaderboardSet from "./LeaderboardSet";
import "./App.css";

function App() {
  let view = null;

  const [data, setData] = useState<IApiData | null>(null);
  const onSuccess = useCallback((data) => setData(data), []);

  if (data) {
    view = <LeaderboardSet apiData={data} />;
  } else {
    view = <JsonDropzone onSuccess={onSuccess} />;
  }

  return <div className="App">{view}</div>;
}

export default App;
