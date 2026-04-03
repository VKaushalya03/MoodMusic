import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthPromptModal } from "./AuthPromptModal";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  Compass,
  Library,
  User,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { usePlayer } from "../context/PlayerContext";
import logo from "../assets/SVG.png"; // ✅ Your custom logo

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const [showAuthModal, setShowAuthModal] = useState(false);

  const { currentSong } = usePlayer();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProtectedNavigation = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/home") return true;
    return location.pathname === path;
  };

  return (
    <>
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Sign up to access your personal Library and Profile."
      />

      <aside
        className={`fixed left-0 top-0 bg-[#0A0A0B] flex flex-col pt-6 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[80px]" : "w-[260px]"
        } ${currentSong ? "h-[calc(100vh-96px)]" : "h-full"}`}
      >
        {/* Minimize Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 bg-[#292348] border border-[#ffffff1a] text-white p-1 rounded-full z-50 hover:bg-[#4B2BEE] transition-colors shadow-lg"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo & Header */}
        <div
          className={`flex items-center mb-10 overflow-hidden transition-all ${isCollapsed ? "px-0 justify-center" : "px-6 gap-[13px]"}`}
        >
          {/* Custom SVG Logo */}
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img
              src={logo}
              alt="MoodMusic Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col shrink-0 items-start gap-1 animate-fade-in whitespace-nowrap">
              <span className="text-white text-lg font-bold">MoodMusic</span>
              <span className="text-[#9B92C9] text-xs">
                {isAuthenticated ? "Premium Account" : "Guest Account"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col items-start w-full px-2 overflow-x-hidden">
          <Link
            to="/"
            title="Home"
            className={`flex items-center w-full py-3 mb-2 rounded-[9999px] transition-colors ${isActive("/") ? "bg-[#292348]" : "hover:bg-[#ffffff0a]"} ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <Home
              size={24}
              className={`shrink-0 ${isCollapsed ? "m-0" : "ml-4 mr-[13px]"} ${isActive("/") ? "text-white" : "text-[#9B92C9]"}`}
            />
            {!isCollapsed && (
              <span
                className={`${isActive("/") ? "text-white font-semibold" : "text-[#9B92C9]"} text-base whitespace-nowrap`}
              >
                Home
              </span>
            )}
          </Link>

          <Link
            to="/discover"
            title="Discover"
            className={`flex items-center w-full py-3 mb-2 rounded-[9999px] transition-colors ${isActive("/discover") ? "bg-[#292348]" : "hover:bg-[#ffffff0a]"} ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <Compass
              size={24}
              className={`shrink-0 ${isCollapsed ? "m-0" : "ml-4 mr-[13px]"} ${isActive("/discover") ? "text-white" : "text-[#9B92C9]"}`}
            />
            {!isCollapsed && (
              <span
                className={`${isActive("/discover") ? "text-white font-semibold" : "text-[#9B92C9]"} text-base whitespace-nowrap`}
              >
                Discover
              </span>
            )}
          </Link>

          <a
            href="/library"
            title="Library"
            onClick={(e) => handleProtectedNavigation(e, "/library")}
            className={`flex items-center w-full py-3 mb-2 rounded-[9999px] transition-colors cursor-pointer ${isActive("/library") ? "bg-[#292348]" : "hover:bg-[#ffffff0a]"} ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <Library
              size={24}
              className={`shrink-0 ${isCollapsed ? "m-0" : "ml-4 mr-[13px]"} ${isActive("/library") ? "text-white" : "text-[#9B92C9]"}`}
            />
            {!isCollapsed && (
              <span
                className={`${isActive("/library") ? "text-white font-semibold" : "text-[#9B92C9]"} text-base whitespace-nowrap`}
              >
                Library
              </span>
            )}
          </a>

          <a
            href="/profile"
            title="Profile"
            onClick={(e) => handleProtectedNavigation(e, "/profile")}
            className={`flex items-center w-full py-3 rounded-[9999px] transition-colors cursor-pointer ${isActive("/profile") ? "bg-[#292348]" : "hover:bg-[#ffffff0a]"} ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <User
              size={24}
              className={`shrink-0 ${isCollapsed ? "m-0" : "ml-4 mr-[13px]"} ${isActive("/profile") ? "text-white" : "text-[#9B92C9]"}`}
            />
            {!isCollapsed && (
              <span
                className={`${isActive("/profile") ? "text-white font-semibold" : "text-[#9B92C9]"} text-base whitespace-nowrap`}
              >
                Profile
              </span>
            )}
          </a>
        </nav>

        {/* Bottom Auth Buttons */}
        <div
          className={`mt-auto mb-6 w-full flex flex-col gap-3 overflow-hidden ${isCollapsed ? "px-2" : "px-6"}`}
        >
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              title="Log Out"
              className={`w-full py-3 rounded-[9999px] flex items-center justify-center text-[#9B92C9] hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/50 transition-all font-bold ${isCollapsed ? "px-0" : ""}`}
            >
              {isCollapsed ? <LogOut size={20} /> : "Log Out"}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                title="Log In"
                className="w-full py-3 flex justify-center rounded-[9999px] text-[#9B92C9] hover:text-white hover:bg-[#ffffff0a] transition-all font-bold"
              >
                {isCollapsed ? <LogIn size={20} /> : "Log In"}
              </Link>
              <Link
                to="/register"
                title="Sign Up"
                className="w-full py-3 flex justify-center rounded-[9999px] text-white bg-[#4B2BEE] hover:bg-[#3b22c0] transition-all font-bold shadow-[0px_4px_6px_#4B2BEE33]"
              >
                {isCollapsed ? <UserPlus size={20} /> : "Sign Up Free"}
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
