import { FocusEvent, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCopy as farCopy } from "@fortawesome/free-regular-svg-icons";
import { faCopy as fasCopy } from "@fortawesome/free-solid-svg-icons";

import "./ShareUrl.css";

declare interface IShareUrlProps {
  hash: string;
}

function BlobUrl(props: IShareUrlProps) {
  const { hash } = props;

  // the icon changes if the URL was copied to the clipboard
  const [icon, setIcon] = useState<IconDefinition>(farCopy);
  useEffect(() => setIcon(farCopy), [hash]);

  const url = `${window.location.origin}${window.location.pathname}#${hash}`;
  const selectUrl = (event: FocusEvent<HTMLInputElement>) => event.target.select();
  const copyUrl = () => navigator.clipboard.writeText(url).then(() => setIcon(fasCopy));

  return (
    <div className="ShareUrl">
      <p>📣 Share a link to this leaderboard with your friends!</p>
      <input className="UrlField" readOnly value={url} onFocus={selectUrl} />
      <FontAwesomeIcon className="CopyIcon" onClick={copyUrl} icon={icon} />
    </div>
  );
}

export default BlobUrl;
