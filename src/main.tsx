import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MintPage from "./pages/MintPage.tsx";
import ResultPage from "./pages/ResultPage.tsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/mint", element: <MintPage /> },
  { path: "/results", element: <ResultPage /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
