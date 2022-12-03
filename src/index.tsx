import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App";

import "./index.css";

const CONTAINER = document.getElementById("root")!;
const ROOT = createRoot(CONTAINER);
ROOT.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
