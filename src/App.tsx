import { useCallback, useState } from "react";

import { IProcessedData, processData } from "./ApiProcessor";
import LeaderboardSet from "./LeaderboardSet";
import JsonDropzone from "./JsonDropzone";
import BlobUrl from "./BlobUrl";

import "./App.css";

function App() {
  const [members, setMembers] = useState<IProcessedData | null>(null);
  const onSuccess = useCallback((data) => setMembers(processData(data)), []);

  return (
    <div className="App">
      <JsonDropzone onSuccess={onSuccess} small={!!members} />
      {members ? <LeaderboardSet members={members} /> : null}
      {members ? <BlobUrl members={members} /> : null}
    </div>
  );
}

export default App;
