import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google"; // <--- Import this
import { User, Mail, Lock, CheckCircle } from "lucide-react";
import logo from "../assets/SVG.png";

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // 1. Standard Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Standard Email/Password Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Registration failed. Try again.");
    }
  };

  // 3. Google Login Handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send Google Token to YOUR Backend
        const res = await axios.post("http://localhost:5000/api/auth/google", {
          token: tokenResponse.credential || tokenResponse.access_token, // Handle implicit/code flow
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } catch (err) {
        console.error("Google Backend Error:", err);
        setError("Google Sign-In failed on server.");
      }
    },
    onError: () => setError("Google Sign-In Failed"),
  });

  return (
    <div className="min-h-screen w-full bg-[#131022] relative overflow-hidden flex flex-col font-sans text-white">
      {/* Background & Navbar remain unchanged... */}
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
        <div className="flex items-center gap-12">
          <Link
            to="/login"
            className="text-sm font-bold text-[#4b2bee] hover:text-[#7c62f5] transition"
          >
            Log in
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-[540px] bg-[#1e1e1e] rounded-[48px] border border-[#ffffff0d] shadow-2xl p-12 flex flex-col gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Join the Rhythm
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Create your account to start personalizing your music
              <br />
              experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
                {error}
              </div>
            )}

            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a unique username"
                  className="w-full h-14 bg-[#ffffff0d] rounded-full border border-transparent focus:border-[#4b2bee] text-slate-200 px-12 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full h-14 bg-[#ffffff0d] rounded-full border border-transparent focus:border-[#4b2bee] text-slate-200 px-12 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-14 bg-[#ffffff0d] rounded-full border border-transparent focus:border-[#4b2bee] text-slate-200 px-12 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="flex-1 relative group">
                <label className="block text-sm font-semibold text-slate-200 mb-2 ml-1">
                  Confirm
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <CheckCircle size={20} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-14 bg-[#ffffff0d] rounded-full border border-transparent focus:border-[#4b2bee] text-slate-200 px-12 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full h-14 rounded-full bg-gradient-to-r from-[#4b2bee] to-[#7c62f5] text-white font-bold text-lg hover:scale-[1.02] transition-all"
            >
              Create Account
            </button>
          </form>

          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ffffff1a]"></div>
            </div>
            <div className="relative bg-[#1e1e1e] px-4 text-xs font-medium text-slate-400 tracking-widest uppercase">
              Or sign up with
            </div>
          </div>

          {/* 4. Connected Google Button */}
          <button
            onClick={() => googleLogin()} // <--- Triggers the Popup
            type="button"
            className="w-full h-12 rounded-full bg-[#ffffff0d] border border-[#ffffff1a] flex items-center justify-center gap-3 hover:bg-[#ffffff1a] transition-colors"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xs">G</span>
            </div>
            <span className="text-sm font-semibold text-white">Google</span>
          </button>

          <div className="text-center text-sm text-slate-400 mt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#4b2bee] font-bold hover:underline"
            >
              Log in here
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
