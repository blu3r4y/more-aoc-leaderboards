import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import ChristmasBall from "./ChristmasBall";
import "./JsonDropzone.css";

function JsonDropzone(props: any) {
  const options = {
    accept: "application/json",
    maxFiles: 1,
    multiple: false,
  };
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone(options);

  let file = "";
  if (acceptedFiles.length === 1) {
    file = acceptedFiles[0].name;
  }

  const rootClassName = useMemo(() => {
    let clazz = "Dropzone";
    if (isDragActive) clazz += " active";
    if (isDragAccept) clazz += " accept";
    if (isDragReject) clazz += " reject";
    return clazz;
  }, [isDragActive, isDragAccept, isDragReject]);

  const textClassName = useMemo(() => {
    let clazz = "DropzoneText";
    if (props.noText) clazz += " hidden";
    return clazz;
  }, [props.noText]);

  const link = (
    <a
      href="https://adventofcode.com/leaderboard/private"
      target="_blank"
      rel="noreferrer"
    >
      private leaderboard
    </a>
  );

  return (
    <div className="JsonDropzone">
      <div {...getRootProps({ className: rootClassName })}>
        <input {...getInputProps()} />
        <ChristmasBall />
      </div>
      <div className={textClassName}>
        <p>Drop a JSON file on the christmas ball to start!</p>
        <small>You can get this file through the API link in your {link}.</small>
        <p>{file}</p>
      </div>
    </div>
  );
}

export default JsonDropzone;
