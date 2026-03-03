import { Music, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AuthPromptModal = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative bg-[#1C1C1E]/80 backdrop-blur-3xl rounded-[40px] p-8 md:p-10 w-full max-w-md border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] text-center overflow-hidden">
        {/* Ambient Liquid Glow Effects behind the glass */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#4B2BEE]/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-[#8B5CF6]/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/60 hover:text-white backdrop-blur-md transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Glossy Icon Container */}
        <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#4B2BEE]/20 to-[#8B5CF6]/20 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_10px_30px_rgba(75,43,238,0.2)] backdrop-blur-md">
          <Music size={36} className="text-[#a594ff]" />
        </div>

        {/* Typography */}
        <h2 className="relative z-10 text-3xl font-extrabold text-white mb-3 tracking-tight">
          Unlock Full Access
        </h2>
        <p className="relative z-10 text-white/60 text-base mb-10 leading-relaxed px-2">
          {message ||
            "Sign up to listen to full tracks, create playlists, and save your favorite moods."}
        </p>

        {/* Apple Music Style Pill Buttons */}
        <div className="relative z-10 flex flex-col gap-4">
          <button
            onClick={() => navigate("/register")}
            className="w-full py-4 flex items-center justify-center rounded-full font-bold text-lg text-white transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(75,43,238,0.3)]"
            style={{ background: "linear-gradient(135deg, #4B2BEE, #8B5CF6)" }}
          >
            Sign Up Free
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold text-white transition-all backdrop-blur-md"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
