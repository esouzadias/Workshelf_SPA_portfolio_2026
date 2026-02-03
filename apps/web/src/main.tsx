import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./app/App";
import HomePage from "./pages/Home";
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/Profile/Components/Profile/Profile";
import "./styles/index.less";
import { AuthProvider } from "./lib/auth.context";
import { LocaleProvider } from "./lib/locale.context";

function Health() {
  return (
    <div className="container">
      <a href="http://localhost:4000/health">Test API /health</a>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "health", element: <Health /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <LocaleProvider>
        <RouterProvider router={router} />
      </LocaleProvider>
    </AuthProvider>
  </React.StrictMode>
);