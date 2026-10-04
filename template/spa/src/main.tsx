import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App";
import "@/app/globals.css";

const container = document.querySelector("#root");

// A missing mount point is a build-order bug, not a runtime condition. Failing
// loudly here beats rendering nothing and leaving the user looking at a blank page.
if (!container) {
  throw new Error("#root is missing from index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
