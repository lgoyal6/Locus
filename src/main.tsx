import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import PublicDemo from "./PublicDemo.tsx";
import "./index.css";

const demo = window.location.pathname === "/demo" || window.location.pathname === "/demo/";
const convex = demo ? null : new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark">
      {demo ? <PublicDemo /> : <ConvexProvider client={convex!}><App /></ConvexProvider>}
    </ThemeProvider>
  </React.StrictMode>,
);
