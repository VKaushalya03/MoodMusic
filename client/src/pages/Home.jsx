import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { useSidebar } from "../context/SidebarContext";
import { usePlayer } from "../context/PlayerContext";
import { Sparkles, Globe, Music, Play, X, Loader2, Save } from "lucide-react";

export const Home = () => {
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const { playSong } = usePlayer();
  const resultsRef = useRef(null);

  // Form State
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedGenre, setSelectedGenre] = useState("Synthwave");

  // Generation & Results State
  const [showLogicModal, setShowLogicModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const [generatedSongs, setGeneratedSongs] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);

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

  // 2. Fetch Playlist & Recommendations
  const fetchGeneratedPlaylist = async (type) => {
    setShowLogicModal(false);
    setLoading(true);
    setHasGenerated(false);

    try {
      const otherGenres = genres.filter((g) => g !== selectedGenre);
      const randomGenre =
        otherGenres[Math.floor(Math.random() * otherGenres.length)];

      const [mainRes, recRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/music/generate?mood=${selectedMood}&language=${selectedLanguage}&genre=${selectedGenre}&type=${type}`,
        ),
        axios.get(
          `http://localhost:5000/api/music/generate?mood=${selectedMood}&language=${selectedLanguage}&genre=${randomGenre}&type=match`,
        ),
      ]);

      // 🚨 THE FIX: Map 'videoId' to 'id' so the Player can read it!
      const formatSongs = (songs) =>
        songs.map((song) => ({ ...song, id: song.videoId }));

      setGeneratedSongs(formatSongs(mainRes.data));
      setRecommendedSongs(formatSongs(recRes.data).slice(0, 10));
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
    setSavePlaylistName(`${selectedMood} ${selectedGenre} Mix`);
    setShowSaveModal(true);
  };

  // 4. Execute Save to Database (Top 10 Songs - Sequential)
  const confirmSavePlaylist = async (e) => {
    e.preventDefault();
    if (!savePlaylistName.trim()) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };

      // Step A: Create Playlist
      const createRes = await axios.post(
        "http://localhost:5000/api/playlists",
        { name: savePlaylistName },
        config,
      );
      const newPlaylistId = createRes.data._id;

      // Step B: Add first 10 songs sequentially to avoid MongoDB Version conflicts
      const songsToSave = generatedSongs.slice(0, 10);

      for (const song of songsToSave) {
        await axios.post(
          `http://localhost:5000/api/playlists/${newPlaylistId}/songs`,
          {
            videoId: song.videoId,
            title: song.title,
            artist: song.artist,
            image: song.image,
          },
          config,
        );
      }

      toast.success(
        `"${savePlaylistName}" saved with ${songsToSave.length} tracks!`,
      );
      setShowSaveModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save playlist.");
    } finally {
      setIsSaving(false);
    }
  };

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
                  Your Generated Mix
                </h2>
                <p className="text-[#9B92C9] text-base mb-8">
                  Perfectly curated for your current vibe.
                </p>

                {/* HORIZONTAL CAROUSEL - 2 ROWS FIXED WIDTH (Matches Figma perfectly) */}
                <div className="grid grid-rows-2 grid-flow-col gap-x-6 gap-y-8 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth w-full [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#ffffff05] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#4b2bee]/70 hover:[&::-webkit-scrollbar-thumb]:bg-[#4b2bee] [&::-webkit-scrollbar-thumb]:rounded-full">
                  {generatedSongs.map((song, i) => (
                    <div
                      key={i}
                      className="flex flex-col w-[211px] shrink-0 snap-start group cursor-pointer"
                      onClick={() => playSong(song, generatedSongs)}
                    >
                      <div className="relative w-[211px] h-[211px] mb-4 rounded-[32px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                        <img
                          src={song.image}
                          alt="cover"
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
                      <span className="text-white text-base font-bold truncate px-1">
                        {song.title}
                      </span>
                      <span className="text-[#9B92C9] text-sm truncate px-1">
                        {song.artist}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Save Playlist Button */}
                <button
                  onClick={handleOpenSaveModal}
                  className="flex items-center bg-[#292348] hover:bg-[#342b5c] text-white py-3 px-8 mt-6 gap-2 rounded-full border border-[#FFFFFF1A] transition-colors shadow-lg"
                >
                  <Save size={18} />
                  <span className="text-base font-bold">
                    Save Top 10 to Library
                  </span>
                </button>

                <div className="h-px w-full bg-white/5 my-14" />

                {/* DYNAMIC MORE RECOMMENDED - 1 ROW */}
                <h3 className="text-white text-2xl font-bold mb-2">
                  More Recommended
                </h3>
                <div className="flex justify-between items-center mb-8 pr-8">
                  <span className="text-[#9B92C9] text-base">
                    Discover something different
                  </span>
                  <button
                    className="text-[#4B2BEE] text-base font-bold hover:underline"
                    onClick={() => navigate("/discover")}
                  >
                    View All
                  </button>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth w-full [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#ffffff05] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#4b2bee]/70 hover:[&::-webkit-scrollbar-thumb]:bg-[#4b2bee] [&::-webkit-scrollbar-thumb]:rounded-full">
                  {recommendedSongs.map((song, i) => (
                    <div
                      key={`rec-${i}`}
                      className="flex flex-col w-[211px] shrink-0 snap-start group cursor-pointer"
                      onClick={() => playSong(song, recommendedSongs)}
                    >
                      <div className="relative w-[211px] h-[211px] mb-4 rounded-[32px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                        <img
                          src={song.image}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt="cover"
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
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center py-10 px-6 sm:px-12">
              <h2 className="text-white text-3xl md:text-4xl font-bold text-center mb-4">
                How should we shape your
                <br className="hidden md:block" /> listening experience?
              </h2>
              <p className="text-[#9B92C9] text-sm md:text-base mb-10 text-center max-w-lg">
                Refine your recommendation logic to match your emotional needs.
              </p>
              <div className="flex flex-col md:flex-row items-stretch self-stretch mb-10 gap-6">
                <button
                  onClick={handleMatchVibe}
                  className="flex flex-col flex-1 items-center bg-[#FFFFFF0D] hover:bg-[#ffffff1a] py-10 px-6 rounded-3xl border-2 border-transparent hover:border-[#4B2BEE] transition-all group"
                >
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/cC9xGCcPoj/959mp42x_expires_30_days.png"
                    className="w-16 h-16 mb-6 rounded-2xl object-cover group-hover:scale-110 transition-transform"
                    alt="Match Vibe"
                  />
                  <span className="text-white text-xl md:text-2xl font-bold mb-3">
                    Match My Vibe
                  </span>
                  <span className="text-[#9B92C9] text-sm text-center">
                    Music that resonates perfectly with your current emotional
                    state.
                  </span>
                </button>
                <button
                  onClick={handleLiftSpirits}
                  className="flex flex-col flex-1 items-center p-[2px] rounded-3xl transition-transform hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #4B2BEE, #8B5CF6)",
                  }}
                >
                  <div className="flex flex-col items-center w-full h-full bg-[#1E1E1E] hover:bg-transparent py-10 px-6 rounded-[22px] transition-colors bg-[url('https://storage.googleapis.com/tagjs-prod.appspot.com/v1/cC9xGCcPoj/23wkf5hy_expires_30_days.png')] bg-cover bg-center">
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/cC9xGCcPoj/qznp1o58_expires_30_days.png"
                      className="w-16 h-16 mb-6 rounded-2xl object-cover shadow-lg"
                      alt="Lift Spirits"
                    />
                    <span className="text-white text-xl md:text-2xl font-bold mb-3">
                      Lift My Spirits
                    </span>
                    <span className="text-[#e2dfff] text-sm text-center">
                      Upbeat selections designed to seamlessly boost your mood
                      and energy.
                    </span>
                  </div>
                </button>
              </div>
              <button
                onClick={handleMatchVibe}
                className="py-4 px-8 bg-white hover:bg-gray-200 text-black text-sm font-bold rounded-full transition-colors"
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
