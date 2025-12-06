import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./components/UserContext"; // ⬅️ import this

// ⚠️ OPTIONAL: This line erases login on every reload.
// If you want persistence, COMMENT IT OUT.
// localStorage.removeItem("user");

// 🔑 Google OAuth client ID
const clientId =
  "280972182232-tknpa40a80lhbhc10aem3sekk6mn6jq1.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
