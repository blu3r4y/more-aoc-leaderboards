import { useCallback, useState, useEffect, useRef } from "react";

import { IProcessedData, processData } from "./ApiProcessor";
import { encodeData, decodeData } from "./ApiEncoder";
import { IApiData } from "./ApiTypes";
import LeaderboardSet from "./LeaderboardSet";
import JsonDropzone from "./JsonDropzone";
import BlobUrl from "./BlobUrl";

import "./App.css";

function App() {
  const isFirstDecode = useRef(false);
  const [data, setData] = useState<IApiData | null>(null);
  const [members, setMembers] = useState<IProcessedData | null>(null);

  // handle data ingest from JsonDropzone or window.location.hash
  const onSuccess = useCallback((e: IApiData) => setData(e), []);
  useEffect(() => {
    if (window.location.hash) {
      isFirstDecode.current = true;
      decodeData(window.location.hash).then(setData);
    }
  }, []);

  // process data dropped from sources, update location hash
  useEffect(() => setMembers(data ? processData(data) : null), [data]);
  useEffect(() => {
    if (!data) return;
    if (isFirstDecode.current) {
      isFirstDecode.current = false;
      return;
    }

    encodeData(data).then((hash) => Object.assign(window.location, { hash }));
  }, [data]);

  return (
    <div className="App">
      <JsonDropzone onSuccess={onSuccess} small={!!members} />
      {members ? <LeaderboardSet members={members} /> : null}
      {members ? <BlobUrl members={members} /> : null}
    </div>
  );
}

export default App;
