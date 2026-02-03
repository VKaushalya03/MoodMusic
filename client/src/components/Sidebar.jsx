import { Link, useLocation } from "react-router-dom";
import { Compass, Library, User, LogOut } from "lucide-react";
import logo from "../assets/SVG.png";

export const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#121212] border-r border-[#ffffff0d] flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="h-24 flex items-center px-8 gap-3">
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src={logo}
            alt="Moody Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          Moody
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link to="/dashboard">
          <div
            className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all ${isActive("/dashboard") ? "bg-[#4b2bee]/20 text-[#4b2bee]" : "text-slate-400 hover:text-white"}`}
          >
            <Compass size={20} />
            <span className="font-medium text-sm">Discover</span>
          </div>
        </Link>

        <Link to="/library">
          <div
            className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all ${isActive("/library") ? "bg-[#4b2bee]/20 text-[#4b2bee]" : "text-slate-400 hover:text-white"}`}
          >
            <Library size={20} />
            <span className="font-medium text-sm">Library</span>
          </div>
        </Link>

        <Link to="/profile">
          <div
            className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all ${isActive("/profile") ? "bg-[#4b2bee]/20 text-[#4b2bee]" : "text-slate-400 hover:text-white"}`}
          >
            <User size={20} />
            <span className="font-medium text-sm">Profile</span>
          </div>
        </Link>
      </nav>
    </aside>
  );
};
