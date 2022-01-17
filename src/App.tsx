import { useCallback, useState } from "react";

import { IMember, processData } from "./ApiProcessor";
import LeaderboardSet from "./LeaderboardSet";
import JsonDropzone from "./JsonDropzone";
import BlobUrl from "./BlobUrl";

import "./App.css";

function App() {
  const [members, setMembers] = useState<IMember[] | null>(null);
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
