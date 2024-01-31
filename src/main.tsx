import React, { createContext, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MintPage from "./pages/MintPage.tsx";
import ResultPage from "./pages/ResultPage.tsx";
import { ethers } from "ethers";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/mint", element: <MintPage /> },
  { path: "/results", element: <ResultPage /> },
]);
// const [contractState, setContractState] = useState<ethers.Contract>();

// export const ContractContext = createContext({
//   contractState: contractState,
//   setContractState: setContractState,
// });

// const value = useMemo(
//   () => ({ contractState, setContractState }),
//   [contractState]
// );

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
