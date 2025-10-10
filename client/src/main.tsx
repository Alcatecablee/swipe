import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply dark theme by default
if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", "dark");
}

// Set dark class on HTML element immediately
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
