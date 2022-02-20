import { useCallback, useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";

import { IProcessedData, processData } from "../api/ApiProcessor";
import { encodeData, decodeData } from "../api/ApiEncoder";
import { IApiData } from "../api/ApiTypes";
import LeaderboardSet from "./LeaderboardSet";
import JsonDropzone from "./JsonDropzone";
import ShareUrl from "./ShareUrl";
import BlobUrl from "./BlobUrl";
import Snow from "./Snow";

import "./App.css";

function App() {
  // raw api data
  const [data, setData] = useState<IApiData | null>(null);
  // compressed hash of the raw api data for sharing
  const [hash, setHash] = useState<string | null>(null);
  // processed metrics for each member
  const [members, setMembers] = useState<IProcessedData | null>(null);
  // avoid encoding the hash again if we already did on mount
  const skipNextEncode = useRef(false);

  // [dropzone] handle data ingest from JsonDropzone
  const onSuccess = useCallback((e: IApiData) => setData(e), []);

  // [hash] handle data ingest from window.location.hash
  const onHashChange = useCallback(() => {
    const hashStr = window.location.hash.substring(1);
    if (hashStr) {
      skipNextEncode.current = true;
      setHash(hashStr);
      decodeData(hashStr).then(setData);
    }
  }, []);

  // [hash] watch for hash changes and decode once on component mount
  useEffect(() => {
    onHashChange();
    window.addEventListener("hashchange", onHashChange, false);
    return () => window.removeEventListener("hashchange", onHashChange, false);
  }, [onHashChange]);

  // [hash] update the hash on data updates
  useEffect(() => {
    if (!data) return;
    if (skipNextEncode.current) {
      skipNextEncode.current = false;
      return;
    }

    encodeData(data).then(setHash);
  }, [data]);

  // process data dropped from sources, update location hash
  useEffect(() => setMembers(data ? processData(data) : null), [data]);

  const shareContainer = (
    <div>
      {hash ? <ShareUrl hash={hash} /> : null}
      {members ? <BlobUrl members={members} /> : null}
    </div>
  );

  return (
    <div className="Container">
      <div className="App">
        <JsonDropzone onSuccess={onSuccess} small={!!members} />
        {members ? <LeaderboardSet members={members} /> : null}
        {members ? shareContainer : null}
      </div>
      <Toaster toastOptions={{ className: "ToastMessage" }} />
      <Snow count={200} />
    </div>
  );
}

export default App;
