import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { useSidebar } from "../context/SidebarContext";
import { Sparkles, Globe, Music, Play } from "lucide-react";

export const Home = () => {
  const navigate = useNavigate();

  // State for selections
  const { isCollapsed } = useSidebar();
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedGenre, setSelectedGenre] = useState("Synthwave");

  // Data Arrays based on your Figma design
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

  // Generate real playlist by sending query to Discover page
  const handleGenerate = () => {
    const query = `${selectedMood} ${selectedLanguage} ${selectedGenre} music`;
    navigate(`/discover?mood=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main
        className={`w-full transition-all duration-300 ease-in-out pt-16 pb-32 min-h-screen flex flex-col overflow-hidden ${
          isCollapsed ? "md:ml-[80px]" : "md:ml-[260px]"
        }`}
      >
        <div className="w-full px-8 md:px-16 overflow-x-hidden">
          {/* Header Section */}
          <div className="flex flex-col items-start mb-12 gap-2 animate-fade-in">
            <h1 className="text-white text-4xl md:text-5xl font-bold tracking-tight">
              How are you feeling today?
            </h1>
            <p className="text-[#9B92C9] text-lg">
              Customize your mood, language, and genre to get the perfect mix.
            </p>
          </div>

          {/* Form Container */}
          <div className="flex flex-col gap-10 max-w-4xl">
            {/* Mood Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-[#4b2bee]" />
                <span className="text-white text-xl font-bold">
                  Select Your Mood
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`py-3 px-6 rounded-full font-medium transitionS-all duration-200 border ${
                      selectedMood === mood
                        ? "bg-[#4B2BEE] text-white border-[#4B2BEE] shadow-[0px_4px_15px_rgba(75,43,238,0.3)]"
                        : "bg-[#1e1e1e] text-slate-300 border-[#ffffff1a] hover:bg-[#2a2a2a] hover:border-[#ffffff33]"
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Globe size={24} className="text-[#4b2bee]" />
                <span className="text-white text-xl font-bold">
                  Select Language
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`py-3 px-6 rounded-full font-medium transition-all duration-200 border ${
                      selectedLanguage === lang
                        ? "bg-[#4B2BEE] text-white border-[#4B2BEE] shadow-[0px_4px_15px_rgba(75,43,238,0.3)]"
                        : "bg-[#1e1e1e] text-slate-300 border-[#ffffff1a] hover:bg-[#2a2a2a] hover:border-[#ffffff33]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Music size={24} className="text-[#4b2bee]" />
                <span className="text-white text-xl font-bold">
                  Select Genres
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`py-3 px-6 rounded-full font-medium transition-all duration-200 border ${
                      selectedGenre === genre
                        ? "bg-[#4B2BEE] text-white border-[#4B2BEE] shadow-[0px_4px_15px_rgba(75,43,238,0.3)]"
                        : "bg-[#1e1e1e] text-slate-300 border-[#ffffff1a] hover:bg-[#2a2a2a] hover:border-[#ffffff33]"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="mt-6 flex items-center justify-center gap-3 py-5 px-10 rounded-full w-fit transition-transform hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #4B2BEE, #8B5CF6)",
                boxShadow: "0px 10px 20px rgba(75,43,238,0.3)",
              }}
            >
              <Play size={20} fill="currentColor" className="text-white" />
              <span className="text-white text-lg font-bold">
                Generate My Playlist
              </span>
            </button>
          </div>
        </div>
      </main>

      <Player />
    </div>
  );
};
