import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error('Could not find the element with id "root".');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

