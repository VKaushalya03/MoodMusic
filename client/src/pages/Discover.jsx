import { useState } from "react";
import { Search } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";

export const Discover = () => {
  const [activeTab, setActiveTab] = useState("songs");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock Data
  const musicCards = [
    {
      id: 1,
      title: "Neon Genesis",
      artist: "Wave Racer",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: 2,
      title: "Summer Highs",
      artist: "M83 ft. LANY",
      color: "from-blue-400 to-teal-400",
    },
    {
      id: 3,
      title: "Midnight City",
      artist: "The Weeknd",
      color: "from-purple-600 to-indigo-600",
    },
    {
      id: 4,
      title: "Lo-Fi Wilderness",
      artist: "Lofi Girl",
      color: "from-green-500 to-emerald-700",
    },
    {
      id: 5,
      title: "Afterglow",
      artist: "Chvrches",
      color: "from-orange-400 to-red-500",
    },
    {
      id: 6,
      title: "Dream State",
      artist: "Tame Impala",
      color: "from-yellow-400 to-orange-500",
    },
    {
      id: 7,
      title: "Echo Chamber",
      artist: "Jon Hopkins",
      color: "from-gray-500 to-slate-700",
    },
    {
      id: 8,
      title: "Rewind 99",
      artist: "Disclosure",
      color: "from-indigo-400 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Sidebar />

      <main className="ml-64 pb-28 pt-8 px-12">
        {" "}
        {/* Padding for sidebar and player */}
        {/* Search & Tabs */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="relative max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for songs, artists, or playlists..."
              className="w-full bg-[#1e1e1e] border border-[#ffffff1a] rounded-full py-3 pl-12 pr-4 text-slate-200 focus:border-[#4b2bee] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 bg-[#1e1e1e] w-fit p-1 rounded-full border border-[#ffffff0d]">
            <button
              onClick={() => setActiveTab("songs")}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === "songs" ? "bg-[#4b2bee] text-white shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              Songs
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${activeTab === "playlists" ? "bg-[#4b2bee] text-white shadow-md" : "text-slate-400 hover:text-white"}`}
            >
              Playlists
            </button>
          </div>
        </div>
        {/* Content Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recommended for you</h2>
            <button className="text-sm font-semibold text-[#4b2bee] hover:underline">
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {musicCards.map((card) => (
              <div
                key={card.id}
                className="bg-[#1e1e1e] p-4 rounded-[32px] border border-[#ffffff0d] hover:bg-[#252525] transition-colors group cursor-pointer"
              >
                {/* Card Image */}
                <div
                  className={`w-full aspect-square rounded-[24px] bg-gradient-to-br ${card.color} mb-4 shadow-lg group-hover:scale-[1.02] transition-transform`}
                ></div>

                <h3 className="font-bold text-white text-base truncate">
                  {card.title}
                </h3>
                <p className="text-slate-400 text-sm mt-1 truncate">
                  {card.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm mb-4">
            Don't see what you're looking for?
          </p>
          <button className="px-6 py-3 bg-[#1e1e1e] border border-[#ffffff1a] rounded-full text-sm font-bold hover:bg-[#252525] transition-colors">
            Explore more genres
          </button>
        </div>
      </main>

      <Player />
    </div>
  );
};
