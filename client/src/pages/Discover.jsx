import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Search, Loader2, X, Plus } from "lucide-react"; // Added Plus icon
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { toast } from "react-hot-toast";
import { usePlayer } from "../context/PlayerContext";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal"; // Import Modal

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_URL = "https://www.googleapis.com/youtube/v3/search";
const SUGGESTION_URL = "https://suggestqueries.google.com/complete/search";

export const Discover = () => {
  const { playSong } = usePlayer();
  const [activeTab, setActiveTab] = useState("songs");
  const [searchQuery, setSearchQuery] = useState("");
  const [musicCards, setMusicCards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Suggestion State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Playlist Modal State
  const [songToAdd, setSongToAdd] = useState(null); // Tracks which song to add

  // 1. Fetch Music Function
  const fetchMusic = async (query = "lofi hip hop") => {
    setLoading(true);
    setShowSuggestions(false);
    try {
      const response = await axios.get(YOUTUBE_URL, {
        params: {
          part: "snippet",
          maxResults: 15,
          q: query,
          type: "video",
          videoCategoryId: "10",
          key: YOUTUBE_API_KEY,
        },
      });

      const formattedData = response.data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        image: item.snippet.thumbnails.high.url,
      }));

      setMusicCards(formattedData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch music. Quota might be exceeded.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Suggestions
  const fetchSuggestions = (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const script = document.createElement("script");
    const callbackName =
      "youtubeSuggestions_" + Math.random().toString(36).substring(7);

    window[callbackName] = (data) => {
      if (data && data[1]) {
        const formattedSuggestions = data[1].map((item) => item[0]);
        setSuggestions(formattedSuggestions);
      }
      document.body.removeChild(script);
      delete window[callbackName];
    };

    script.src = `${SUGGESTION_URL}?client=youtube&ds=yt&q=${encodeURIComponent(query)}&callback=${callbackName}`;
    document.body.appendChild(script);
  };

  useEffect(() => {
    fetchMusic("top hits 2025");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      fetchMusic(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    fetchMusic(suggestion);
  };

  const handleCardClick = (e, card) => {
    e.stopPropagation();
    playSong(card, musicCards);
  };

  // Open the Add to Playlist Modal
  const openPlaylistModal = (e, card) => {
    e.stopPropagation(); // Stop card click (play)
    setSongToAdd(card);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Sidebar />

      <main className="ml-64 pb-28 pt-8 px-12">
        <div className="flex flex-col gap-6 mb-8">
          {/* Search Bar */}
          <div className="relative max-w-2xl z-20" ref={searchContainerRef}>
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for songs, artists, or moods..."
              className="w-full bg-[#1e1e1e] border border-[#ffffff1a] rounded-t-[24px] rounded-b-[24px] py-3 pl-12 pr-10 text-slate-200 focus:border-[#4b2bee] transition-all outline-none"
              style={{
                borderBottomLeftRadius:
                  showSuggestions && suggestions.length > 0 ? 0 : 24,
                borderBottomRightRadius:
                  showSuggestions && suggestions.length > 0 ? 0 : 24,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => setShowSuggestions(true)}
            />

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-[#1e1e1e] border-x border-b border-[#ffffff1a] rounded-b-[24px] shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer flex items-center gap-3 text-sm text-slate-300 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={14} className="text-slate-500" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 bg-[#1e1e1e] w-fit p-1 rounded-full border border-[#ffffff0d]">
            <button
              onClick={() => {
                setActiveTab("songs");
                fetchMusic("trending music 2025");
              }}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === "songs" ? "bg-[#4b2bee] text-white shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              Songs
            </button>
            <button
              onClick={() => {
                setActiveTab("playlists");
                fetchMusic("music playlists");
              }}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === "playlists" ? "bg-[#4b2bee] text-white shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              Playlists
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery && musicCards.length > 0
                ? `Results for "${searchQuery}"`
                : "Recommended for you"}
            </h2>
            <button
              onClick={() => fetchMusic("new music releases 2025")}
              className="text-sm font-semibold text-[#4b2bee] hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-[#4b2bee]" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {musicCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-[#1e1e1e] p-4 rounded-[32px] border border-[#ffffff0d] hover:bg-[#252525] transition-colors group cursor-pointer flex flex-col h-full relative"
                  onClick={(e) => handleCardClick(e, card)}
                >
                  {/* --- Add to Playlist Button --- */}
                  <button
                    onClick={(e) => openPlaylistModal(e, card)}
                    className="absolute top-6 right-6 w-8 h-8 bg-black/50 hover:bg-[#4b2bee] backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                    title="Add to playlist"
                  >
                    <Plus size={16} />
                  </button>

                  <div className="w-full aspect-square rounded-[24px] overflow-hidden mb-4 shadow-lg">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3
                    className="font-bold text-white text-base truncate"
                    title={card.title}
                  >
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 truncate">
                    {card.artist}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => fetchMusic("random music genres")}
            className="px-6 py-3 bg-[#1e1e1e] border border-[#ffffff1a] rounded-full text-sm font-bold hover:bg-[#252525] transition-colors"
          >
            Explore more genres
          </button>
        </div>
      </main>

      {/* Playlist Selection Modal */}
      {songToAdd && (
        <AddToPlaylistModal
          song={songToAdd}
          onClose={() => setSongToAdd(null)}
        />
      )}

      <Player />
    </div>
  );
};
