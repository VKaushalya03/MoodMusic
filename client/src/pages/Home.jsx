import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { useSidebar } from "../context/SidebarContext";
import { usePlayer } from "../context/PlayerContext";
import {
  Sparkles,
  Globe,
  Music,
  Play,
  X,
  Loader2,
  Save,
  Activity,
  Zap,
} from "lucide-react";

export const Home = () => {
  const { isCollapsed } = useSidebar();
  const { playSong } = usePlayer();
  const resultsRef = useRef(null);

  // Form State
  const [selectedMood, setSelectedMood] = useState("Sad");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedGenre, setSelectedGenre] = useState("Synthwave");

  // Generation & Results State
  const [showLogicModal, setShowLogicModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationType, setGenerationType] = useState("match"); // Tracks which UI to show

  const [generatedSongs, setGeneratedSongs] = useState([]);

  // Save Playlist Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savePlaylistName, setSavePlaylistName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const moods = ["Happy", "Sad", "Focused", "Energetic", "Chill", "Romantic"];
  const languages = ["English", "Spanish", "Korean", "Japanese", "French"];
  const genres = [
    "Lo-fi",
    "Synthwave",
    "Indie Rock",
    "Techno",
    "Jazz Fusion",
    "Classical",
  ];

  // 1. Open Logic Modal
  const handleGenerateClick = () => setShowLogicModal(true);

  // 2. Fetch Playlist Logic (Updated to POST request for 3-Stage Logic)
  const fetchGeneratedPlaylist = async (mode) => {
    setShowLogicModal(false);
    setLoading(true);
    setHasGenerated(false);
    setGenerationType(mode);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/music/recommend",
        {
          mood: selectedMood,
          language: selectedLanguage,
          genre: selectedGenre,
          mode: mode,
        },
      );

      setGeneratedSongs(res.data);
      setHasGenerated(true);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate playlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchVibe = () => fetchGeneratedPlaylist("match");
  const handleLiftSpirits = () => fetchGeneratedPlaylist("lift");

  // 3. Open Save Modal
  const handleOpenSaveModal = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to save playlists.");
      return;
    }
    const mixType = generationType === "lift" ? "Therapy Mix" : "Vibe Match";
    setSavePlaylistName(`${selectedMood} ${selectedGenre} ${mixType}`);
    setShowSaveModal(true);
  };

  // 4. Execute Save to Database (With Pre-Filtering & Fault Tolerance)
  const confirmSavePlaylist = async (e) => {
    e.preventDefault();
    if (!savePlaylistName.trim()) return;

    setIsSaving(true);
    try {
      const config = {
        headers: { "x-auth-token": localStorage.getItem("token") },
      };

      // Step A: Create the empty playlist container
      const createRes = await axios.post(
        "http://localhost:5000/api/playlists",
        { name: savePlaylistName },
        config,
      );
      const newPlaylistId = createRes.data._id;

      // 🚨 THE UPGRADE: Remove duplicates BEFORE sending to the server
      const uniqueSongs = [];
      const seenIds = new Set();

      for (const song of generatedSongs) {
        const trackId = song.id || song.videoId;
        if (!seenIds.has(trackId)) {
          seenIds.add(trackId);
          uniqueSongs.push(song);
        }
      }

      let savedCount = 0;

      // Step B: Save unique songs individually
      for (const song of uniqueSongs) {
        try {
          await axios.post(
            `http://localhost:5000/api/playlists/${newPlaylistId}/songs`,
            {
              videoId: song.id || song.videoId || `generated_${Math.random()}`,
              title: song.title || "Unknown Title",
              artist: song.artist || song.channel || "Unknown Artist",
              image:
                song.image ||
                song.thumbnail ||
                "https://via.placeholder.com/150",
            },
            config,
          );

          savedCount++;
        } catch (trackError) {
          console.warn(
            `Skipped track "${song.title}":`,
            trackError.response?.data || trackError.message,
          );
        }
      }

      // Step C: Success Output
      if (savedCount > 0) {
        toast.success(
          `"${savePlaylistName}" successfully saved with ${savedCount} tracks!`,
        );
        setShowSaveModal(false);
      } else {
        toast.error("Could not save tracks to the playlist. Check console.");
      }
    } catch (err) {
      console.error("Playlist Creation Error:", err);
      toast.error(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Failed to create playlist container.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- REUSABLE TRACK CAROUSEL COMPONENT ---
  // We write the HTML for the scrollable row here once, and reuse it for all 3 stages below.
  const TrackCarousel = ({ songs, title, subtitle }) => (
    <div className="mb-10 w-full animate-fade-in">
      {title && (
        <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
          {title}
        </h3>
      )}
      {subtitle && <p className="text-[#9B92C9] text-sm mb-6">{subtitle}</p>}

      <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth w-full [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#ffffff05] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#4b2bee]/70 hover:[&::-webkit-scrollbar-thumb]:bg-[#4b2bee] [&::-webkit-scrollbar-thumb]:rounded-full">
        {songs.map((song, i) => (
          <div
            key={i}
            className="flex flex-col w-[211px] shrink-0 snap-start group cursor-pointer"
            onClick={() => playSong(song, generatedSongs)}
          >
            <div className="relative w-[211px] h-[211px] mb-4 rounded-[32px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-transparent group-hover:border-[#4B2BEE]/50 transition-colors">
              <img
                src={song.image}
                alt="cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-14 h-14 bg-[#4b2bee] rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                  <Play size={24} fill="white" className="text-white ml-1" />
                </div>
              </div>
            </div>
            <span className="text-white text-base font-bold truncate px-1">
              {song.title}
            </span>
            <span className="text-[#9B92C9] text-sm truncate px-1 mt-0.5">
              {song.artist}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main
        className={`w-full transition-all duration-300 ease-in-out pt-12 pb-32 min-h-screen flex flex-col overflow-hidden ${isCollapsed ? "md:ml-[80px]" : "md:ml-[260px]"}`}
      >
        <div className="w-full px-8 md:px-12 overflow-x-hidden">
          <div className="flex flex-col items-start mb-10 gap-2 animate-fade-in">
            <h1 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
              How are you feeling today?
            </h1>
            <p className="text-[#9B92C9] text-base md:text-lg">
              Customize your mood, language, and genre to get the perfect mix.
            </p>
          </div>

          <div className="flex flex-col gap-8 max-w-4xl mb-16">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#4b2bee]" />
                <span className="text-white text-lg font-bold">
                  Select Your Mood
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`py-3 px-6 rounded-full text-base font-medium transition-all duration-200 border ${selectedMood === mood ? "bg-[#4B2BEE] text-white border-[#4B2BEE] shadow-[0px_4px_15px_rgba(75,43,238,0.3)]" : "bg-[#292348] text-white border-transparent hover:bg-[#342b5c]"}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Globe size={20} className="text-[#4b2bee]" />
                <span className="text-white text-lg font-bold">
                  Select Languages
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`py-3 px-6 rounded-full text-base font-medium transition-all duration-200 border ${selectedLanguage === lang ? "bg-[#4B2BEE] text-white border-[#4B2BEE] shadow-[0px_4px_15px_rgba(75,43,238,0.3)]" : "bg-[#292348] text-white border-transparent hover:bg-[#342b5c]"}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Music size={20} className="text-[#4b2bee]" />
                <span className="text-white text-lg font-bold">
                  Select Genres
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`py-3 px-6 rounded-full text-base font-medium transition-all duration-200 border ${selectedGenre === genre ? "bg-[#4B2BEE] text-white border-[#4B2BEE] shadow-[0px_4px_15px_rgba(75,43,238,0.3)]" : "bg-[#292348] text-white border-transparent hover:bg-[#342b5c]"}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateClick}
              disabled={loading}
              className="mt-6 flex items-center justify-center gap-3 py-4 px-10 rounded-full w-fit transition-transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-70 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(180deg, #4B2BEE, #8B5CF6)",
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                <Play size={20} fill="currentColor" className="text-white" />
              )}
              <span className="text-white text-lg font-bold">
                {loading ? "Generating..." : "Generate My Playlist"}
              </span>
            </button>
          </div>

          {/* --- GENERATED PLAYLIST SECTION --- */}
          <div ref={resultsRef} className="pt-8 w-full overflow-hidden">
            {hasGenerated && generatedSongs.length > 0 && (
              <div className="animate-fade-in w-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="py-1.5 px-3 bg-[#4B2BEE]/20 text-[#4B2BEE] text-xs font-bold rounded-xl border border-[#4b2bee]/30">
                    {selectedMood}
                  </span>
                  <span className="py-1.5 px-3 bg-[#4B2BEE]/20 text-[#4B2BEE] text-xs font-bold rounded-xl border border-[#4b2bee]/30">
                    {selectedLanguage}
                  </span>
                  <span className="py-1.5 px-3 bg-[#4B2BEE]/20 text-[#4B2BEE] text-xs font-bold rounded-xl border border-[#4b2bee]/30">
                    {selectedGenre}
                  </span>
                </div>

                <h2 className="text-white text-3xl font-bold mb-1">
                  {generationType === "lift"
                    ? "Your Curated Therapy Mix"
                    : "Your Generated Mix"}
                </h2>
                <p className="text-[#9B92C9] text-base mb-10">
                  {generationType === "lift"
                    ? "Algorithmic emotion regulation mapped to your current vibe."
                    : "Perfectly curated for your current vibe."}
                </p>

                {/* DYNAMIC RENDERING BASED ON GENERATION TYPE */}
                {generationType === "lift" ? (
                  <div className="flex flex-col w-full">
                    <TrackCarousel
                      title="Stage 1: Acknowledgment"
                      subtitle={`Meeting you where you are: matching your current feeling of ${selectedMood}.`}
                      songs={generatedSongs.filter(
                        (s) => s.stage === "Validation",
                      )}
                    />

                    <TrackCarousel
                      title="Stage 2: The Transition"
                      subtitle="Slowly shifting the physiological energy towards a better state."
                      songs={generatedSongs.filter(
                        (s) => s.stage === "Transition",
                      )}
                    />

                    <TrackCarousel
                      title="Stage 3: The Target State"
                      subtitle="Elevating your mood with uplifting frequencies."
                      songs={generatedSongs.filter((s) => s.stage === "Target")}
                    />
                  </div>
                ) : (
                  <TrackCarousel
                    title="Iso-Principle Match"
                    subtitle={`Music perfectly aligned with ${selectedMood}.`}
                    songs={generatedSongs}
                  />
                )}

                <button
                  onClick={handleOpenSaveModal}
                  className="flex items-center bg-[#292348] hover:bg-[#342b5c] text-white py-3.5 px-8 mt-4 gap-2 rounded-full border border-[#FFFFFF1A] transition-colors shadow-lg"
                >
                  <Save size={18} />
                  <span className="text-base font-bold">
                    Save Collection to Library
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- SAVE PLAYLIST MODAL --- */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={confirmSavePlaylist}
            className="bg-[#1E1E1E] rounded-[32px] border border-[#ffffff1a] w-full max-w-md p-8 shadow-[0px_25px_50px_rgba(0,0,0,0.4)] relative"
          >
            <button
              type="button"
              onClick={() => setShowSaveModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-white text-2xl font-bold mb-2">
              Save Playlist
            </h3>
            <p className="text-[#9B92C9] text-sm mb-6">
              Give your newly generated mix a name.
            </p>
            <input
              type="text"
              value={savePlaylistName}
              onChange={(e) => setSavePlaylistName(e.target.value)}
              placeholder="e.g. My Awesome Mix"
              className="w-full bg-[#121212] border border-[#ffffff1a] focus:border-[#4B2BEE] rounded-xl px-4 py-3 text-white outline-none mb-8 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={isSaving || !savePlaylistName.trim()}
              className="w-full flex justify-center items-center py-3.5 bg-[#4B2BEE] hover:bg-[#3b22c0] disabled:bg-[#4b2bee]/50 text-white rounded-xl font-bold transition-colors"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Save to Library"
              )}
            </button>
          </form>
        </div>
      )}

      {/* --- LOGIC SELECTION MODAL --- */}
      {showLogicModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1E1E1E] rounded-[32px] border border-[#ffffff1a] w-full max-w-4xl shadow-[0px_25px_50px_rgba(0,0,0,0.4)] overflow-hidden relative">
            <button
              onClick={() => setShowLogicModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center py-10 px-6 sm:px-12 relative z-10">
              <h2 className="text-white text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight">
                How should we shape your
                <br className="hidden md:block" /> listening experience?
              </h2>
              <p className="text-[#9B92C9] text-sm md:text-base mb-10 text-center max-w-lg">
                Refine your recommendation logic to match your emotional needs.
              </p>

              <div className="flex flex-col md:flex-row items-stretch self-stretch mb-10 gap-6">
                {/* MATCH MY VIBE CARD */}
                <button
                  onClick={handleMatchVibe}
                  className="flex flex-col flex-1 items-center bg-[#ffffff05] hover:bg-[#ffffff0a] py-10 px-6 rounded-3xl border border-white/5 hover:border-[#4B2BEE]/50 transition-all group shadow-lg"
                >
                  <div className="w-16 h-16 mb-6 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Activity size={32} className="text-[#a594ff]" />
                  </div>
                  <span className="text-white text-xl md:text-2xl font-bold mb-3">
                    Match My Vibe
                  </span>
                  <span className="text-[#9B92C9] text-sm text-center">
                    Music that resonates perfectly with your current emotional
                    state.
                  </span>
                </button>

                {/* LIFT MY SPIRITS CARD */}
                <button
                  onClick={handleLiftSpirits}
                  className="flex flex-col flex-1 items-center p-[2px] rounded-3xl transition-transform hover:scale-[1.02] active:scale-95 group shadow-[0_10px_30px_rgba(75,43,238,0.2)]"
                  style={{
                    background: "linear-gradient(135deg, #4B2BEE, #8B5CF6)",
                  }}
                >
                  <div className="flex flex-col items-center w-full h-full bg-[#1E1E1E] group-hover:bg-transparent py-10 px-6 rounded-[22px] transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#4b2bee]/20 to-transparent opacity-60 pointer-events-none" />

                    <div className="w-16 h-16 mb-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <Zap
                        size={32}
                        className="text-white"
                        fill="currentColor"
                      />
                    </div>

                    <span className="text-white text-xl md:text-2xl font-bold mb-3 relative z-10">
                      Lift My Spirits
                    </span>
                    <span className="text-[#e2dfff] text-sm text-center relative z-10">
                      Upbeat selections designed to seamlessly boost your mood
                      and energy.
                    </span>
                  </div>
                </button>
              </div>

              <button
                onClick={handleMatchVibe}
                className="py-4 px-10 bg-white hover:bg-gray-200 text-black text-sm font-bold rounded-full transition-colors shadow-lg"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      <Player />
    </div>
  );
};
