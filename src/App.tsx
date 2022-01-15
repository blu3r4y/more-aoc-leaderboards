import { useCallback, useState } from "react";

import { IApiData } from "./ApiTypes";
import JsonDropzone from "./JsonDropzone";
import LeaderboardSet from "./LeaderboardSet";
import "./App.css";

function App() {
  const [data, setData] = useState<IApiData | null>(null);
  const onSuccess = useCallback((data) => setData(data), []);

  return (
    <div className="App">
      <JsonDropzone onSuccess={onSuccess} small={!!data} />
      {data ? <LeaderboardSet apiData={data} /> : null}
    </div>
  );
}

export default App;
