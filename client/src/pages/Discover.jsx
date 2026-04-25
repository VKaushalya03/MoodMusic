import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Search, Loader2, X, Plus, Play } from "lucide-react"; // Removed Compass
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { toast } from "react-hot-toast";
import { usePlayer } from "../context/PlayerContext";
import { useSidebar } from "../context/SidebarContext";
import { AddToPlaylistModal } from "../components/AddToPlaylistModal";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_DETAILS_URL = "https://www.googleapis.com/youtube/v3/videos";
const SUGGESTION_URL = "https://suggestqueries.google.com/complete/search";

export const Discover = () => {
  const { playSong } = usePlayer();
  const [activeTab, setActiveTab] = useState("songs");
  const [searchQuery, setSearchQuery] = useState("");
  const [musicCards, setMusicCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isCollapsed } = useSidebar();

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const [songToAdd, setSongToAdd] = useState(null);

  // 1. Fetch Music Function (UPGRADED: Hidden API Modifiers & 3-Min Filter)
  const fetchMusic = async (query = "lofi hip hop") => {
    setLoading(true);
    setShowSuggestions(false);

    try {
      // 🚨 THE FIX: Create a hidden search query so the UI stays clean!
      let hiddenApiQuery = query;
      if (
        activeTab === "playlists" &&
        !query.toLowerCase().includes("playlist")
      ) {
        hiddenApiQuery = `${query} full playlist`;
      } else if (
        activeTab === "songs" &&
        !query.toLowerCase().includes("audio")
      ) {
        hiddenApiQuery = `${query} official audio`;
      }

      // Step A: Fetch a larger batch of 30 videos
      const searchResponse = await axios.get(YOUTUBE_URL, {
        params: {
          part: "snippet",
          maxResults: 30,
          q: hiddenApiQuery, // Uses the hidden messy query, not the clean UI query
          type: "video",
          videoCategoryId: "10",
          key: YOUTUBE_API_KEY,
        },
      });

      if (
        !searchResponse.data.items ||
        searchResponse.data.items.length === 0
      ) {
        setMusicCards([]);
        setLoading(false);
        return;
      }

      const videoIds = searchResponse.data.items
        .map((item) => item.id.videoId)
        .join(",");

      // Step B: Fetch EXACT duration of the videos
      const detailsResponse = await axios.get(YOUTUBE_DETAILS_URL, {
        params: {
          part: "contentDetails,snippet",
          id: videoIds,
          key: YOUTUBE_API_KEY,
        },
      });

      // Step C: Mathematically purge any video under 3 minutes (180 seconds)
      const parseDurationToSeconds = (duration) => {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
      };

      const validVideos = detailsResponse.data.items.filter((video) => {
        const totalSeconds = parseDurationToSeconds(
          video.contentDetails.duration,
        );
        return totalSeconds >= 180; // Must be at least 3 minutes
      });

      // Format surviving videos and slice back down to 15 items
      const formattedData = validVideos.slice(0, 15).map((item) => ({
        id: item.id,
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

  // 2. Real Randomizer Logic (Clean Genre UI)
  const handleExploreRandom = () => {
    const randomGenresList = [
      "Synthwave",
      "Lo-fi Hip Hop",
      "Indie Rock",
      "Jazz Fusion",
      "Classical",
      "Techno",
      "Deep House",
      "R&B",
      "Acoustic Pop",
      "Ambient Chill",
      "K-Pop",
      "Latin Trap",
      "Afrobeats",
      "Neo-Soul",
      "Psychedelic Rock",
      "Cyberpunk",
      "Vaporwave",
      "Bossa Nova",
    ];

    // Pick a clean genre name
    const randomGenre =
      randomGenresList[Math.floor(Math.random() * randomGenresList.length)];

    // 🚨 THE FIX: Set the UI search bar to strictly the clean genre name
    setSearchQuery(randomGenre);
    fetchMusic(randomGenre);
  };

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
    const params = new URLSearchParams(window.location.search);
    const initialMood = params.get("mood");

    if (initialMood) {
      setSearchQuery(initialMood);
      fetchMusic(initialMood);
    } else {
      setSearchQuery("Trending Hits 2025");
      fetchMusic("Trending Hits 2025");
    }
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

  const openPlaylistModal = (e, card) => {
    e.stopPropagation();
    setSongToAdd(card);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main
        className={`relative w-full transition-all duration-300 ease-in-out pt-12 pb-32 min-h-screen flex flex-col ${
          isCollapsed ? "md:ml-[80px]" : "md:ml-[260px]"
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4B2BEE]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full px-8 md:px-12 box-border relative z-10">
          {/* Header Section without Compass Icon */}
          <div className="flex flex-col items-start gap-1 mb-10 animate-fade-in">
            <h1 className="text-white text-4xl md:text-5xl font-bold tracking-tight">
              Discover
            </h1>
            <p className="text-[#9B92C9] text-lg">
              Search, explore, and find your next favorite track.
            </p>
          </div>

          <div className="flex flex-col gap-6 mb-12 animate-fade-in">
            <div className="relative max-w-2xl z-20" ref={searchContainerRef}>
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for songs, artists, or moods..."
                className="w-full bg-white/5 border border-white/10 rounded-t-[24px] rounded-b-[24px] py-4 pl-14 pr-12 text-white focus:border-[#4b2bee] focus:bg-white/10 backdrop-blur-md shadow-lg transition-all outline-none placeholder:text-white/30"
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
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-[#1C1C1E]/95 backdrop-blur-3xl border-x border-b border-white/10 rounded-b-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-5 py-3.5 hover:bg-white/10 cursor-pointer flex items-center gap-4 text-sm font-medium text-white/80 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search size={14} className="text-white/40" />
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 bg-white/5 backdrop-blur-md w-fit p-1.5 rounded-full border border-white/10 shadow-lg">
              <button
                onClick={() => {
                  setActiveTab("songs");
                  setSearchQuery("Trending Hits 2025");
                  fetchMusic("Trending Hits 2025");
                }}
                className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === "songs"
                    ? "bg-[#4b2bee] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Songs
              </button>
              <button
                onClick={() => {
                  setActiveTab("playlists");
                  setSearchQuery("Viral Music Playlists");
                  fetchMusic("Viral Music Playlists");
                }}
                className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === "playlists"
                    ? "bg-[#4b2bee] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Playlists
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {searchQuery && musicCards.length > 0
                  ? `Results for "${searchQuery}"`
                  : "Recommended for you"}
              </h2>
              <button
                onClick={() => {
                  setSearchQuery("New Music Releases");
                  fetchMusic("New Music Releases");
                }}
                className="text-sm font-bold text-[#4b2bee] hover:text-white transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#4b2bee]" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10 animate-fade-in">
                {musicCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex flex-col w-full shrink-0 group cursor-pointer"
                    onClick={(e) => handleCardClick(e, card)}
                  >
                    <div className="relative w-full aspect-square mb-4 rounded-[28px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.3)] border border-white/5 group-hover:border-[#4B2BEE]/50 transition-colors">
                      <button
                        onClick={(e) => openPlaylistModal(e, card)}
                        className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-[#4b2bee] backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 shadow-lg border border-white/10"
                        title="Add to playlist"
                      >
                        <Plus size={18} />
                      </button>

                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-14 h-14 bg-[#4b2bee] rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                          <Play
                            size={24}
                            fill="white"
                            className="text-white ml-1"
                          />
                        </div>
                      </div>
                    </div>

                    <h3
                      className="font-bold text-white text-base truncate px-1"
                      title={card.title}
                    >
                      {card.title}
                    </h3>
                    <p className="text-[#9B92C9] text-sm mt-0.5 truncate px-1">
                      {card.artist}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={handleExploreRandom}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-base font-bold text-white hover:bg-white/10 backdrop-blur-md shadow-lg transition-all"
            >
              Explore Random Genres
            </button>
          </div>
        </div>
      </main>

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
