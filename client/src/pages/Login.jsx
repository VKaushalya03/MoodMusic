import { useState } from "react";
import { Link } from "react-router-dom"; // Removed useNavigate as we force reload
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { toast, Toaster } from "react-hot-toast"; // Import Toast
import { Mail, Lock } from "lucide-react";
import logo from "../assets/SVG.png";
import overlayIcon from "../assets/Overlay.png";

export const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Save Data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Success Message
      toast.success("Welcome back!", { duration: 2000 });

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.msg || "Login failed. Check your credentials.",
      );
      setLoading(false);
    }
  };

  // Google Login Handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const toastId = toast.loading("Connecting to Google...");
      try {
        const res = await axios.post("http://localhost:5000/api/auth/google", {
          token: tokenResponse.access_token,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        toast.success("Google Login Successful!", { id: toastId });

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } catch (err) {
        console.error("Google Backend Error:", err);
        toast.error("Google Sign-In failed.", { id: toastId });
      }
    },
    onError: () => toast.error("Google Sign-In Failed"),
  });

  return (
    <div className="min-h-screen w-full bg-[#131022] relative overflow-hidden flex flex-col font-sans text-white">
      {/* Toast Configuration */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #333",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#4b2bee", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] bg-[#4b2bee] rounded-full mix-blend-screen filter blur-[120px] opacity-15"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[50vw] h-[50vw] bg-[#7c62f5] rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
      </div>

      <nav className="relative z-10 w-full h-[85px] flex items-center justify-between px-10 border-b border-[#ffffff1a] bg-[#131022]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src={logo}
              alt="Moody Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Moody
          </span>
        </div>
        <Link to="/register">
          <button className="h-11 px-6 rounded-full bg-[#ffffff0d] border border-[#ffffff1a] font-bold text-sm text-white hover:bg-[#ffffff1a] transition-colors">
            Create an account
          </button>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-[500px] bg-[#1e1e1e] rounded-[48px] border border-[#ffffff0d] shadow-2xl p-10 flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 flex items-center justify-center">
              <img
                src={overlayIcon}
                alt="Welcome Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-[#9b92c9] text-sm font-medium mt-1">
                Ready for your Vibe?
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative group">
              <label className="block text-sm font-semibold text-white mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9b92c9] opacity-50">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full h-14 bg-[#131022] rounded-full border border-[#3b3267] focus:border-[#4b2bee] text-[#9b92c9] px-14 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-semibold text-white mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9b92c9] opacity-50">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-14 bg-[#131022] rounded-full border border-[#3b3267] focus:border-[#4b2bee] text-[#9b92c9] px-14 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <a
                  href="#"
                  className="text-xs font-medium text-[#9b92c9] hover:text-white transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full h-14 rounded-full bg-gradient-to-r from-[#4b2bee] to-[#6e55f3] text-white font-bold text-base hover:scale-[1.02] transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ffffff1a]"></div>
            </div>
            <div className="relative bg-[#1e1e1e] px-4 text-xs font-normal text-[#9b92c9] tracking-widest uppercase">
              Or continue with
            </div>
          </div>

          <div className="flex justify-center w-full">
            <button
              onClick={() => googleLogin()}
              type="button"
              className="w-full h-12 rounded-full border border-[#ffffff1a] flex items-center justify-center gap-3 hover:bg-[#ffffff1a] transition-colors"
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">G</span>
              </div>
              <span className="text-sm font-semibold text-white">Google</span>
            </button>
          </div>

          <div className="text-center text-sm text-[#9b92c9] mt-2">
            New to Moody?{" "}
            <Link
              to="/register"
              className="text-[#4b2bee] font-bold hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-[#9b92c966]">
        © 2024 Moody. All rights reserved.
      </div>
    </div>
  );
};
