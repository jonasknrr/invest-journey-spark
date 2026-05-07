import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// One-time progress reset
const RESET_KEY = "investify_reset_v2";
if (!localStorage.getItem(RESET_KEY)) {
  localStorage.removeItem("finlearn_progress");
  localStorage.removeItem("investify_levels");
  localStorage.setItem(RESET_KEY, "1");
}

createRoot(document.getElementById("root")!).render(<App />);
