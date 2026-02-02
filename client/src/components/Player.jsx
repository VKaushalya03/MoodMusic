import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Heart,
} from "lucide-react";

export const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ FIX: Removed 'setProgress' since we aren't dragging the bar yet
  const [progress] = useState(30);

  return (
    <div className="fixed bottom-0 left-0 w-full h-24 bg-[#121214]/95 backdrop-blur-md border-t border-[#ffffff0d] z-30 flex items-center px-6 justify-between">
      {/* 1. Song Info */}
      <div className="flex items-center gap-4 w-[30%]">
        <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden">
          {/* Placeholder Album Art */}
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm">Neon Skyline</h4>
          <p className="text-slate-400 text-xs">Electric Dreams</p>
        </div>
        <button className="text-slate-400 hover:text-[#4b2bee] ml-2">
          <Heart size={18} />
        </button>
      </div>

      {/* 2. Controls */}
      <div className="flex flex-col items-center gap-2 w-[40%]">
        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-white">
            <Shuffle size={18} />
          </button>
          <button className="text-white hover:text-[#4b2bee]">
            <SkipBack size={24} fill="currentColor" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button className="text-white hover:text-[#4b2bee]">
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button className="text-slate-400 hover:text-white">
            <Repeat size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span>0:45</span>
          <div className="flex-1 h-1 bg-[#ffffff1a] rounded-full overflow-hidden cursor-pointer relative group">
            <div
              className="absolute top-0 left-0 h-full bg-[#4b2bee] rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span>3:45</span>
        </div>
      </div>

      {/* 3. Volume */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
        <Volume2 size={20} className="text-slate-400" />
        <div className="w-24 h-1 bg-[#ffffff1a] rounded-full overflow-hidden cursor-pointer">
          <div className="h-full bg-white w-2/3"></div>
        </div>
      </div>
    </div>
  );
};
