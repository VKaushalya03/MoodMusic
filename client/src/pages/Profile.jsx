import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { Shield, User, LogOut } from "lucide-react";

export const Profile = () => {
  // ✅ FIX: Removed 'setUser' because it was unused
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser
      ? JSON.parse(storedUser)
      : { username: "Guest", email: "guest@example.com" };
  });

  return (
    <div className="min-h-screen bg-[#121212] text-white">
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

          <form className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#121212] rounded-full h-12 px-6 border border-[#ffffff0d] focus:border-[#4b2bee]"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#121212] rounded-full h-12 px-6 border border-[#ffffff0d] focus:border-[#4b2bee]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">
                  Confirm
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#121212] rounded-full h-12 px-6 border border-[#ffffff0d] focus:border-[#4b2bee]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#4b2bee] to-blue-600 rounded-full font-bold shadow-lg hover:scale-[1.01] transition-transform"
            >
              Update Password
            </button>
          </form>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
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
