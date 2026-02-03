import { useState, useEffect } from "react";
import axios from "axios";
import { X, Plus, ListMusic } from "lucide-react";
import { toast } from "react-hot-toast";

export const AddToPlaylistModal = ({ song, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's playlists when modal opens
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/playlists", {
          headers: { "x-auth-token": token },
        });
        setPlaylists(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load playlists");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  const handleAdd = async (playlistId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/playlists/${playlistId}/songs`,
        {
          videoId: song.id,
          title: song.title,
          artist: song.artist,
          image: song.image,
        },
        { headers: { "x-auth-token": token } },
      );
      toast.success("Added to playlist!");
      onClose(); // Close modal on success
    } catch (err) {
      if (
        err.response &&
        err.response.data.msg === "Song already in playlist"
      ) {
        toast.error("Song is already in this playlist");
      } else {
        toast.error("Failed to add song");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] rounded-[32px] p-6 w-full max-w-sm border border-[#ffffff1a] shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <ListMusic className="text-[#4b2bee]" size={24} />
            <h3 className="text-xl font-bold text-white">Add to Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Selected Song Preview */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-[#ffffff0d] rounded-2xl border border-[#ffffff0d]">
          <img
            src={song.image}
            alt="art"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-white truncate">
              {song.title}
            </p>
            <p className="text-xs text-slate-400 truncate">{song.artist}</p>
          </div>
        </div>

        {/* Playlist List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {loading ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              Loading...
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              No playlists found. <br /> Create one in your Library first!
            </div>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist._id}
                onClick={() => handleAdd(playlist._id)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#ffffff05] hover:bg-[#ffffff10] border border-transparent hover:border-[#4b2bee]/30 transition-all group text-left"
              >
                <span className="font-medium text-slate-200 group-hover:text-white truncate max-w-[80%]">
                  {playlist.name}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#ffffff0d] flex items-center justify-center group-hover:bg-[#4b2bee] transition-colors">
                  <Plus
                    size={16}
                    className="text-slate-400 group-hover:text-white"
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
