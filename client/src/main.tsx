import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

try {
	const savedTheme = localStorage.getItem("erp.theme");
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
		document.documentElement.classList.add("dark");
	}
} catch {
	// ignore
}

createRoot(document.getElementById("root")!).render(<App />);
