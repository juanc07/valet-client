import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Custom styles with Tailwind via PostCSS
import App from "./App.tsx";

// Log NODE_ENV to verify its value
console.log("NODE_ENV value:", process.env.NODE_ENV);

// Disable console.log in production
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

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