import { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";

import { Leaderboard, schema } from "./ApiTypes";
import ChristmasBall from "./ChristmasBall";
import "./JsonDropzone.css";

function JsonDropzone(props: any) {
  // possibly show parsing errors
  const [error, setError] = useState(null);

  // process dropped files
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // there should be one file only
      if (acceptedFiles.length !== 1) return;

      // read, parse, validate
      await readFile(acceptedFiles[0])
        .then(JSON.parse)
        .then((obj) => schema.validateAsync(obj))
        .then((obj) => {
          if (props.onSuccess) props.onSuccess(obj as Leaderboard);
          setError(null);
        })
        .catch((err) => {
          const msg = err.toString().split("\n")[0];
          if (props.onError) props.onError(msg);
          setError(msg);
        });
    },
    [props.onSuccess, props.onError]
  );

  // initialize dropzone
  const options = { accept: "application/json", maxFiles: 1, multiple: false, onDrop };
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } =
    useDropzone(options);

  const rootClassName = useMemo(() => {
    let clazz = "DropzoneField";
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

  const errorHtml = <p className="Description error">{error}</p>;
  const descriptionHtml = (
    <p className="Description">
      Get this file through the API in your{" "}
      <a
        href="https://adventofcode.com/leaderboard/private"
        target="_blank"
        rel="noreferrer"
      >
        private leaderboard
      </a>
    </p>
  );

  return (
    <div className="JsonDropzone">
      <div {...getRootProps({ className: rootClassName })}>
        <input {...getInputProps()} />
        <ChristmasBall />
      </div>
      <div className={textClassName}>
        <p className="Title">Drop a JSON file on the christmas ball to start!</p>
        {error ? errorHtml : descriptionHtml}
      </div>
    </div>
  );
}

async function readFile(file: File): Promise<string> {
  var reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onerror = () => reject("IOError: can not read file");
    reader.onabort = () => reject("IOError: file read aborted");
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(file);
  });
}

export default JsonDropzone;
