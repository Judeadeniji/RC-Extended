import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home.jsx";
import Counter from "./pages/counter.jsx";
import PrevSig from "./pages/prev-with-signals.jsx";
import PrevSig2 from "./pages/prev-with-signals-2.jsx";
import PrevStores from "./pages/prev-with-stores.jsx";
import All from "./pages/all-characters"
import Single from "./pages/single-character"
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Counter />,
  },
  {
    path: "/prev-sig-2",
    element: <PrevSig2 />,
  },
  {
    path: "/prev-sig-1",
    element: <PrevSig />,
  },
  {
    path: "/x",
    element: <Home />,
  },
  {
    path: "/all",
    element: <All />,
  },
  {
    path: "/u/:character",
    element: <Single />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider {...{ router }} />
  </React.StrictMode>
);
