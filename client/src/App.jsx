import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SidebarProvider } from "./context/SidebarContext"; // ✅ IMPORT THIS
import { PlayerProvider } from "./context/PlayerContext"; // Assuming you have this

// Pages
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Discover } from "./pages/Discover";
import { Profile } from "./pages/Profile";
import { Library } from "./pages/Library";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <SidebarProvider>
      {" "}
      {/* ✅ WRAP APP HERE */}
      <Router>
        <Routes>
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />

          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/dashboard" element={<Navigate to="/discover" />} />

          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/library"
            element={isAuthenticated ? <Library /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </SidebarProvider>
  );
}

export default App;
