import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { prefetch } from "./services/api.ts";
import App from "./App.tsx";

prefetch();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
