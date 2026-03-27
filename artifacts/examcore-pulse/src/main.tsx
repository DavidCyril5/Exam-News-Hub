import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Register a global auth token getter so every API call automatically
// attaches the admin JWT when present — no need to pass headers manually.
setAuthTokenGetter(() => localStorage.getItem("examcore_admin_token"));

createRoot(document.getElementById("root")!).render(<App />);
