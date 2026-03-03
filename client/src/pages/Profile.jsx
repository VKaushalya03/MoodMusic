import { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { Shield, User, LogOut, KeyRound } from "lucide-react";
import { API_BASE_URL } from "../config";
import { useSidebar } from "../context/SidebarContext";

export const Profile = () => {
  // User State
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser
      ? JSON.parse(storedUser)
      : { username: "Guest", email: "guest@example.com" };
  });

  const { isCollapsed } = useSidebar();

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${API_BASE_URL}/api/auth/updatepassword`,
        { currentPassword, newPassword },
        {
          headers: { "x-auth-token": token },
        },
      );

      toast.success(res.data.msg || "Password updated successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.msg || "Failed to update password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1C1C1E",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(16px)",
            borderRadius: "16px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#4b2bee", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />

      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main
        className={`relative w-full transition-all duration-300 ease-in-out pt-16 pb-32 min-h-screen flex flex-col items-center ${
          isCollapsed ? "md:ml-[80px]" : "md:ml-[260px]"
        }`}
      >
        {/* Ambient Background Glows */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#4B2BEE]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl px-6 md:px-12 relative z-10 flex flex-col items-center">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-5 mb-12 w-full animate-fade-in">
            <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-[#4b2bee] to-[#8B5CF6] shadow-[0_10px_40px_rgba(75,43,238,0.3)]">
              <div className="w-full h-full rounded-full bg-[#1C1C1E] flex items-center justify-center text-4xl font-bold overflow-hidden border-4 border-[#121212]">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={56} className="text-white/40" />
                )}
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {user.username}
              </h1>
              <p className="text-[#9B92C9] mt-2 font-medium">{user.email}</p>
            </div>
          </div>

          {/* Security Card */}
          <div className="w-full bg-[#1C1C1E]/80 backdrop-blur-3xl rounded-[40px] border border-white/5 p-6 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-8">
              <div className="p-2 bg-[#4b2bee]/20 rounded-xl">
                <Shield className="text-[#a594ff]" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Security & Password
                </h2>
                <p className="text-sm text-[#9B92C9]">
                  Manage your account credentials
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest mb-3 ml-2">
                  <KeyRound size={14} /> Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 rounded-2xl h-14 px-6 border border-white/10 focus:border-[#4b2bee] focus:bg-white/10 transition-all outline-none text-white placeholder:text-white/20"
                />
              </div>

              {/* New Password & Confirm (Responsive Grid) */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3 ml-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 rounded-2xl h-14 px-6 border border-white/10 focus:border-[#4b2bee] focus:bg-white/10 transition-all outline-none text-white placeholder:text-white/20"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-3 ml-2">
                    Confirm New
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 rounded-2xl h-14 px-6 border border-white/10 focus:border-[#4b2bee] focus:bg-white/10 transition-all outline-none text-white placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-14 mt-4 flex items-center justify-center rounded-2xl font-bold text-lg text-white transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(75,43,238,0.2)] ${
                  loading ? "opacity-70 cursor-not-allowed hover:scale-100" : ""
                }`}
                style={{
                  background: "linear-gradient(135deg, #4B2BEE, #8B5CF6)",
                }}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-12 flex items-center justify-center gap-2 w-full md:w-auto px-10 py-4 rounded-full border border-red-500/20 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all mx-auto font-bold shadow-lg"
          >
            <LogOut size={20} />
            Log Out of Account
          </button>
        </div>
      </main>

      <Player />
    </div>
  );
};
