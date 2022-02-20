import { useEffect, useState } from "react";

import { IProcessedData } from "../api/ApiProcessor";

import "./BlobUrl.css";

declare interface IBlobUrlProps {
  members: IProcessedData;
}

function BlobUrl(props: IBlobUrlProps) {
  const { members } = props;

  const [url, setUrl] = useState<string | null>(null);

  // create blob URLs for the members JSON
  useEffect(() => {
    const jzon = JSON.stringify(members, null, 2);
    const blob = new Blob([jzon], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);

    // clean-up function
    return () => URL.revokeObjectURL(blobUrl);
  }, [members]);

  return (
    <div className="BlobUrl">
      <p>
        🤓 Data nerd? Get all computed metrics for these leaderboards{" "}
        <a href={url ?? "#"} download>
          here
        </a>
        .
      </p>
    </div>
  );
}

export default BlobUrl;
