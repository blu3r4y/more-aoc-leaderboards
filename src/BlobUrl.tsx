import { useEffect, useState } from "react";

import { IMember } from "./ApiProcessor";

import "./BlobUrl.css";

declare interface BlobUrlProps {
  members: IMember[];
}

function BlobUrl(props: BlobUrlProps) {
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
    <p className="BlobUrl">
      🤓 Data nerd? Get all computed metrics for these leaderboards{" "}
      <a href={url ?? "#"} download>
        here
      </a>
    </p>
  );
}

export default BlobUrl;
