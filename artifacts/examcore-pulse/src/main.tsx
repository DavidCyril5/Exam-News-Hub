import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Register a global auth token getter so every API call automatically
// attaches the admin JWT when present — no need to pass headers manually.
// Note: useLocalStorage stores values as JSON.stringify'd, so we must
// JSON.parse to get the raw string (removes the extra wrapping quotes).
setAuthTokenGetter(() => {
  const raw = localStorage.getItem("examcore_admin_token");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as string | null;
  } catch {
    return raw;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
