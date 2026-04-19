// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { Toaster } from "react-hot-toast";

// import "./index.css";
// import App from "./App.jsx";
// import { ThemeProvider } from "next-themes";
// import { AuthProvider } from "./context/AuthContext.jsx";

// createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <AuthProvider>
//       <ThemeProvider attribute="class" defaultTheme="light">
//         <App />
//         <Toaster position="bottom-right" />
//       </ThemeProvider>
//     </AuthProvider>
//   </BrowserRouter>
// );

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./context/AuthContext.jsx";

// ✅ ADD THIS
import { Provider } from "react-redux";
import { store } from "./store/store";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}> {/* ✅ ADD THIS */}
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <App />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  </BrowserRouter>
);