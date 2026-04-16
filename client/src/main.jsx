import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <App />
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);

