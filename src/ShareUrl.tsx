import { FocusEvent } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy as farCopy } from "@fortawesome/free-regular-svg-icons";

import "./ShareUrl.css";

declare interface IShareUrlProps {
  hash: string;
}

function BlobUrl(props: IShareUrlProps) {
  const { hash } = props;

  const url = `${window.location.origin}${window.location.pathname}#${hash}`;
  const selectUrl = (event: FocusEvent<HTMLInputElement>) => event.target.select();
  const copyUrl = () =>
    navigator.clipboard.writeText(url).then(() =>
      toast("URL copied to clipboard", {
        position: "bottom-center",
      })
    );

  return (
    <div className="ShareUrl">
      <p>📣 Share a link to this leaderboard with your friends!</p>
      <input className="UrlField" readOnly value={url} onFocus={selectUrl} />
      <FontAwesomeIcon className="CopyIcon" onClick={copyUrl} icon={farCopy} />
    </div>
  );
}

export default BlobUrl;
