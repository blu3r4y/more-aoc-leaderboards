import { useEffect, useState, useMemo } from "react";

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

  // get basename of the blob URL
  const filename = useMemo(() => {
    if (!url) return null;
    const parts = url.split("/");
    return `${parts[parts.length - 1]}.json`;
  }, [url]);

  return (
    <div className="BlobUrl">
      <p>
        🤓 Data nerd? Get all metrics{" "}
        <a href={url ?? "#"} download={filename}>
          here
        </a>
        .
      </p>
    </div>
  );
}

export default BlobUrl;
