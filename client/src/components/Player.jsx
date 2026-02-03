import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { usePlayer } from "../context/PlayerContext";
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
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    volume,
    setVolume,
    setIsPlaying,
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [favoritesId, setFavoritesId] = useState(null);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // --- Reset Logic ---
  const [lastSongId, setLastSongId] = useState(currentSong?.id);

  if (currentSong?.id !== lastSongId) {
    setLastSongId(currentSong?.id);
    setIsReady(false);
    setProgress(0);
    setDuration(0);
    setIsLiked(false);
  }

  // 1. Fetch "Favorites" Playlist ID on Mount
  useEffect(() => {
    const fetchFavoritesId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/api/playlists", {
          headers: { "x-auth-token": token },
        });
        const favList = res.data.find((p) => p.isFavorites);
        if (favList) setFavoritesId(favList._id);
      } catch (err) {
        console.error("Error fetching playlists", err);
      }
    };
    fetchFavoritesId();
  }, []);

  // 2. Check if current song is in Favorites
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!currentSong || !favoritesId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/playlists", {
          headers: { "x-auth-token": token },
        });
        const favList = res.data.find((p) => p._id === favoritesId);
        if (favList) {
          const exists = favList.songs.some(
            (s) => s.videoId === currentSong.id,
          );
          setIsLiked(exists);
        }
      } catch (err) {
        console.error("Error checking favorites:", err);
      }
    };

    if (currentSong) {
      checkIfLiked();
    }
  }, [currentSong?.id, favoritesId]);

  // 3. Toggle Like (Now with Auto-Create)
  const toggleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };

      let targetId = favoritesId;

      // ✅ FIX: If Favorites playlist doesn't exist, create it automatically!
      if (!targetId) {
        console.log("Favorites list missing. Creating one...");
        const createRes = await axios.post(
          "http://localhost:5000/api/playlists",
          {
            name: "Favorites",
            isFavorites: true,
          },
          config,
        );

        targetId = createRes.data._id;
        setFavoritesId(targetId); // Update state for next time
      }

      if (isLiked) {
        // Remove
        await axios.delete(
          `http://localhost:5000/api/playlists/${targetId}/songs/${currentSong.id}`,
          config,
        );
        setIsLiked(false);
        toast.success("Removed from Favorites");
      } else {
        // Add
        await axios.post(
          `http://localhost:5000/api/playlists/${targetId}/songs`,
          {
            videoId: currentSong.id,
            title: currentSong.title,
            artist: currentSong.artist,
            image: currentSong.image,
          },
          config,
        );
        setIsLiked(true);
        toast.success("Added to Favorites");
      }
    } catch (err) {
      console.error("Toggle like error:", err);
      toast.error("Failed to update favorites");
    }
  };

  // --- Existing Player Logic ---
  const startProgressTracking = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setProgress(playerRef.current.getCurrentTime());
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSeek = (e) => {
    if (!isReady || !playerRef.current) return;
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX / progressBar.clientWidth;
    const newTime = clickPosition * duration;
    playerRef.current.seekTo(newTime, true);
    setProgress(newTime);
  };

  useEffect(() => {
    if (!currentSong) return;
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "360",
        width: "640",
        videoId: currentSong.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            setDuration(event.target.getDuration());
            if (isPlaying) event.target.playVideo();
            event.target.setVolume(volume * 100);
          },
          onStateChange: (event) => {
            if (event.data === 1) {
              setIsPlaying(true);
              startProgressTracking();
            } else if (event.data === 2) {
              setIsPlaying(false);
              stopProgressTracking();
            } else if (event.data === 0) {
              stopProgressTracking();
              nextSong();
            }
          },
          onError: () => {
            setIsReady(false);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) initPlayer();
    else window.onYouTubeIframeAPIReady = initPlayer;

    return () => {
      stopProgressTracking();
      if (playerRef.current && playerRef.current.destroy)
        playerRef.current.destroy();
    };
  }, [currentSong?.id]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    if (isPlaying) playerRef.current.playVideo();
    else playerRef.current.pauseVideo();
  }, [isPlaying, isReady]);

  useEffect(() => {
    if (playerRef.current && isReady) playerRef.current.setVolume(volume * 100);
  }, [volume, isReady]);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-24 bg-[#121214]/95 backdrop-blur-md border-t border-[#ffffff0d] z-30 flex items-center px-6 justify-between transition-all duration-300">
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "640px",
          height: "360px",
        }}
      >
        <div id="youtube-player"></div>
      </div>

      {/* Song Info */}
      <div className="flex items-center gap-4 w-[30%]">
        <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-[#ffffff1a]">
          <img
            src={currentSong.image}
            alt="Album Art"
            className="w-full h-full object-cover animate-fade-in"
          />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-white font-bold text-sm truncate max-w-[200px]">
            {currentSong.title}
          </h4>
          <p className="text-slate-400 text-xs truncate max-w-[200px]">
            {currentSong.artist}
          </p>
        </div>
        <button
          onClick={toggleLike}
          className={`transition-colors ml-2 ${isLiked ? "text-[#4b2bee]" : "text-slate-400 hover:text-[#4b2bee]"}`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 w-[40%]">
        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-white transition-colors">
            <Shuffle size={18} />
          </button>
          <button
            onClick={prevSong}
            className="text-white hover:text-[#4b2bee] transition-colors active:scale-95"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!isReady}
            className={`w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] ${!isReady ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="text-white hover:text-[#4b2bee] transition-colors active:scale-95"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors">
            <Repeat size={18} />
          </button>
        </div>
        <div className="w-full flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span>{formatTime(progress)}</span>
          <div
            className="flex-1 h-1 bg-[#ffffff1a] rounded-full cursor-pointer relative group overflow-hidden"
            onClick={handleSeek}
          >
            <div className="absolute top-0 left-0 h-full w-full bg-slate-800" />
            <div
              className="absolute top-0 left-0 h-full bg-[#4b2bee] rounded-full transition-all duration-100 ease-linear group-hover:bg-[#5b3cff]"
              style={{
                width: duration ? `${(progress / duration) * 100}%` : "0%",
              }}
            ></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
        <Volume2 size={20} className="text-slate-400" />
        <div className="w-24 h-1 bg-[#ffffff1a] rounded-full overflow-hidden cursor-pointer relative group">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className="h-full bg-white group-hover:bg-[#4b2bee] transition-colors"
            style={{ width: `${volume * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
