import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Pages
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Discover } from "./pages/Discover";
import { Profile } from "./pages/Profile";
import { Library } from "./pages/Library";

function App() {
  // ✅ FIX: Removed 'setIsAuthenticated' because it was unused
  const [isAuthenticated] = useState(() => !!localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        <Route
          path="/register"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* Dashboard leads to Discover */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Discover /> : <Navigate to="/login" />}
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />

        {/* Library Route */}
        <Route
          path="/library"
          element={isAuthenticated ? <Library /> : <Navigate to="/login" />}
        />

        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
