import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PlayerProvider } from "./context/PlayerContext"; // <--- Import this

const GOOGLE_CLIENT_ID =
  "559077721257-tmmo8kig7jcjijmtdn2jr6rdp59job32.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  // Remove <React.StrictMode>
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </GoogleOAuthProvider>,
);
