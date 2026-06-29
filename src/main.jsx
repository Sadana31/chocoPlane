import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './index.css' // <--- Ensure this is imported!

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
);