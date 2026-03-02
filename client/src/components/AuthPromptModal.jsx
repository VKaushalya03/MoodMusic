import { Music, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AuthPromptModal = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#1e1e1e] rounded-[32px] p-8 w-full max-w-md border border-[#ffffff1a] shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-[#4b2bee]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Music size={32} className="text-[#4b2bee]" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Unlock Full Access
        </h2>
        <p className="text-slate-400 mb-8">
          {message ||
            "Sign up to listen to full tracks, create playlists, and save your favorite moods."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3.5 bg-[#4b2bee] hover:bg-[#3b22c0] rounded-xl font-bold text-white transition-all shadow-lg shadow-[#4b2bee]/20"
          >
            Sign Up Now
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3.5 bg-transparent border border-[#ffffff1a] hover:bg-[#ffffff0d] rounded-xl font-bold text-white transition-all"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
