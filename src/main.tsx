import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Custom styles with Tailwind via PostCSS
import App from "./App.tsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}