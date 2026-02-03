import { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast"; // Import Toast
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { Shield, User, LogOut } from "lucide-react";

export const Profile = () => {
  // User State
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser
      ? JSON.parse(storedUser)
      : { username: "Guest", email: "guest@example.com" };
  });

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // 1. Validation
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

    setLoading(true); // Start loading spinner logic if you had one, or just disable button

    try {
      const token = localStorage.getItem("token");

      // 2. API Request
      const res = await axios.put(
        "http://localhost:5000/api/auth/updatepassword",
        { currentPassword, newPassword },
        {
          headers: { "x-auth-token": token }, // Send token for auth
        },
      );

      // 3. Success
      toast.success(res.data.msg || "Password updated successfully!");

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      // 4. Error Handling
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
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Toast Configuration (Dark Mode Style) */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #333",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#4b2bee",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Sidebar />

      <main className="ml-64 pb-28 pt-12 px-12 flex flex-col items-center">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-[#4b2bee] to-blue-500">
            <div className="w-full h-full rounded-full bg-[#1e1e1e] flex items-center justify-center text-4xl font-bold overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={64} className="text-slate-400" />
              )}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <p className="text-slate-400 mt-1">{user.email}</p>
          </div>
        </div>

        {/* Security Card */}
        <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-[48px] border border-[#ffffff0d] p-8 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[#ffffff0d] pb-6 mb-8">
            <Shield className="text-[#4b2bee]" />
            <h2 className="text-xl font-bold">Security & Password</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121212] rounded-full h-12 px-6 border border-[#ffffff0d] focus:border-[#4b2bee] transition-colors outline-none text-white"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121212] rounded-full h-12 px-6 border border-[#ffffff0d] focus:border-[#4b2bee] transition-colors outline-none text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">
                  Confirm
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121212] rounded-full h-12 px-6 border border-[#ffffff0d] focus:border-[#4b2bee] transition-colors outline-none text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 bg-gradient-to-r from-[#4b2bee] to-blue-600 rounded-full font-bold shadow-lg hover:scale-[1.01] transition-transform ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="mt-12 flex items-center gap-2 px-8 py-3 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-semibold">Logout Account</span>
        </button>
      </main>

      <Player />
    </div>
  );
};
