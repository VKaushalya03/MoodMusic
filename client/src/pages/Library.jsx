import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Search,
  Plus,
  Play,
  Trash2,
  X,
  Loader2,
  Edit2,
  Check,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Player } from "../components/Player";
import { usePlayer } from "../context/PlayerContext";
import { useSidebar } from "../context/SidebarContext";
import { API_BASE_URL } from "../config";

export const Library = () => {
  const { playSong } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { isCollapsed } = useSidebar();

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [managingPlaylist, setManagingPlaylist] = useState(null);

  // Fetch Playlists
  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/playlists`, {
        headers: { "x-auth-token": token },
      });
      setPlaylists(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Create Playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/playlists`,
        { name: newPlaylistName },
        { headers: { "x-auth-token": token } },
      );
      toast.success("Playlist created!");
      setNewPlaylistName("");
      setShowCreateModal(false);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create playlist");
    }
  };

  // Delete Playlist
  const handleDeletePlaylist = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/playlists/${id}`, {
        headers: { "x-auth-token": token },
      });
      toast.success("Playlist deleted");
      fetchPlaylists();
    } catch (err) {
      console.error(err);
      toast.error("Could not delete playlist");
    }
  };

  // Start Editing
  const handleStartEdit = (e, playlist) => {
    e.stopPropagation();
    setManagingPlaylist(playlist);
    setRenameValue(playlist.name);
  };

  const handleRemoveSong = async (playlistId, videoId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/playlists/${playlistId}/songs/${videoId}`,
        {
          headers: { "x-auth-token": token },
        },
      );
      toast.success("Song removed");

      // Update local state immediately for fast UI
      setManagingPlaylist((prev) => ({
        ...prev,
        songs: prev.songs.filter((s) => s.videoId !== videoId),
      }));
      fetchPlaylists(); // Refresh background data
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove song");
    }
  };

  // Save Rename
  const handleRename = async (e, id) => {
    e.stopPropagation();
    if (!renameValue.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/playlists/${id}`,
        { name: renameValue },
        { headers: { "x-auth-token": token } },
      );
      toast.success("Playlist renamed");
      setEditingId(null);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename");
    }
  };

  // Play playlist
  const handlePlayPlaylist = (e, playlist) => {
    e.stopPropagation();
    if (playlist.songs.length > 0) {
      const formattedSongs = playlist.songs.map((s) => ({
        id: s.videoId,
        title: s.title,
        artist: s.artist,
        image: s.image,
      }));
      playSong(formattedSongs[0], formattedSongs);
    } else {
      toast.error("Playlist is empty");
    }
  };

  // Helper to format date like "Oct 24, 2023"
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const gradients = [
    "from-orange-400 to-rose-500",
    "from-blue-400 to-indigo-600",
    "from-emerald-400 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-slate-500 to-slate-800",
  ];

  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <Toaster
        position="top-center"
        toastOptions={{ style: { background: "#1e1e1e", color: "#fff" } }}
      />
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main
        className={`w-full transition-all duration-300 ease-in-out px-8 md:px-16 pt-16 pb-32 min-h-screen ${
          isCollapsed ? "md:ml-[80px]" : "md:ml-[260px]"
        }`}
      >
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Your Saved Playlists
          </h1>
          <p className="text-slate-400 text-sm">
            Manage and listen to your curated mood-based collections.
          </p>
        </div>

        <div className="relative max-w-sm mb-8 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4b2bee] transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search playlists..."
            className="w-full bg-[#1e1e1e] border border-[#ffffff1a] rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:border-[#4b2bee] transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-[#4b2bee]" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Create New Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="relative w-full aspect-[347/352] bg-[#1e1e1e] rounded-[32px] overflow-hidden border-2 border-dashed border-[#ffffff1a] flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white hover:border-[#4b2bee] hover:bg-[#4b2bee]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md border border-[#ffffff0d]">
                <Plus size={20} />
              </div>
              <span className="font-semibold text-xs">Create New</span>
            </button>

            {/* Render Playlists */}
            {filteredPlaylists.map((playlist, index) => (
              <article
                key={playlist._id}
                onClick={() => setEditingId(null)}
                className="relative w-full aspect-[347/352] bg-[#1e1e1e] rounded-[32px] overflow-hidden border border-[#ffffff0d] group hover:-translate-y-1 transition-transform duration-300 shadow-xl"
              >
                {/* 1. Top Image Section */}
                <div
                  className={`absolute w-full h-[55%] top-0 left-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* 2. Floating Play Button */}
                <button
                  onClick={(e) => handlePlayPlaylist(e, playlist)}
                  className="absolute left-4 top-[55%] -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#4b2bee] rounded-full shadow-lg z-20 hover:scale-110 transition-transform cursor-pointer border-2 border-[#1e1e1e]"
                  aria-label="Play playlist"
                  type="button"
                >
                  <Play
                    size={16}
                    fill="currentColor"
                    className="text-white ml-0.5"
                  />
                </button>

                {/* 3. Playlist Title / Edit Input */}
                <div className="absolute top-[calc(55%_+_24px)] left-4 right-4 h-7 flex items-center z-10">
                  {editingId === playlist._id ? (
                    <div className="flex items-center gap-1 w-full bg-[#1e1e1e] border-b border-[#4b2bee] z-40">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent text-white font-bold text-sm w-full outline-none p-0"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleRename(e, playlist._id)}
                        className="text-[#4b2bee] hover:text-white"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <h2
                      className="font-bold text-white text-base truncate leading-tight w-full"
                      title={playlist.name}
                    >
                      {playlist.name}
                    </h2>
                  )}
                </div>

                {/* 4. Metadata (Now using formatDate correctly!) */}
                <div className="absolute top-[calc(55%_+_52px)] left-4 flex items-center gap-2 opacity-80">
                  <span className="font-normal text-gray-400 text-[10px] tracking-wide whitespace-nowrap">
                    {playlist.songs.length} Tracks
                  </span>
                  <div className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
                  <time className="font-normal text-gray-400 text-[10px] tracking-wide whitespace-nowrap">
                    {formatDate(playlist.createdAt)}
                  </time>
                </div>

                {/* 5. Avatars */}
                <div className="absolute bottom-4 left-4 flex items-center">
                  {playlist.songs.length === 0 ? (
                    <div className="w-6 h-6 rounded-full border border-[#1e1e1e] bg-[#2a2a2a]" />
                  ) : (
                    playlist.songs.slice(0, 3).map((song, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-[#1e1e1e] overflow-hidden bg-slate-800"
                        style={{ marginLeft: i > 0 ? "-8px" : "0" }}
                      >
                        <img
                          src={song.image}
                          alt="art"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* 6. Edit & Delete Buttons */}
                {!playlist.isFavorites && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-30">
                    <button
                      onClick={(e) => handleStartEdit(e, playlist)}
                      className="w-7 h-7 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#4b2bee] border border-[#ffffff1a] rounded-full text-slate-400 hover:text-white transition-all shadow-md"
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                      className="w-7 h-7 flex items-center justify-center bg-[#2a2a2a] hover:bg-red-600 border border-[#ffffff1a] rounded-full text-slate-400 hover:text-white transition-all shadow-md"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-[32px] p-8 w-full max-w-sm border border-[#ffffff1a] shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">New Collection</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist Name"
                className="w-full bg-[#121212] rounded-xl px-4 py-3 text-white border border-[#ffffff1a] focus:border-[#4b2bee] outline-none mb-6 text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#4b2bee] hover:bg-[#3b22c0] rounded-xl font-bold text-sm transition-all"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE PLAYLIST MODAL */}
      {managingPlaylist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-[32px] p-8 w-full max-w-2xl max-h-[80vh] flex flex-col border border-[#ffffff1a] shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div className="w-full mr-8">
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider ml-1 mb-1 block">
                  Rename Playlist
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="flex-1 bg-[#121212] rounded-xl px-4 py-3 text-white border border-[#ffffff1a] focus:border-[#4b2bee] outline-none"
                  />
                  <button
                    onClick={(e) => handleRename(e, managingPlaylist._id)}
                    className="px-6 py-3 bg-[#4b2bee] hover:bg-[#3b22c0] rounded-xl font-bold transition-colors"
                  >
                    Save Name
                  </button>
                </div>
              </div>
              <button
                onClick={() => setManagingPlaylist(null)}
                className="p-2 bg-[#2a2a2a] rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border-t border-[#ffffff0d] pt-6">
              <h4 className="text-sm font-bold text-slate-400 mb-4">
                Tracks ({managingPlaylist.songs.length})
              </h4>

              {managingPlaylist.songs.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No tracks in this playlist yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {managingPlaylist.songs.map((song) => (
                    <div
                      key={song.videoId}
                      className="flex items-center justify-between p-3 bg-[#ffffff05] rounded-2xl border border-transparent hover:border-[#ffffff1a] group transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={song.image}
                          alt="cover"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-white font-bold text-sm line-clamp-1">
                            {song.title}
                          </p>
                          <p className="text-slate-400 text-xs line-clamp-1">
                            {song.artist}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveSong(managingPlaylist._id, song.videoId)
                        }
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Remove from playlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Player />
    </div>
  );
};
