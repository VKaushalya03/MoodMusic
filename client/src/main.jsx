import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PlayerProvider } from "./context/PlayerContext"; // <--- Import this

const GOOGLE_CLIENT_ID =
  "545861443515-hi452can3dh2aenroj4tfsgstf4onav7.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  // Remove <React.StrictMode>
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </GoogleOAuthProvider>,
);
