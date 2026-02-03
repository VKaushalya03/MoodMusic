const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  videoId: { type: String, required: true }, // YouTube Video ID
  title: { type: String, required: true },
  artist: { type: String },
  image: { type: String },
  addedAt: { type: Date, default: Date.now },
});

const PlaylistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: "My Playlist",
  },
  // We can flag one playlist as the default "Favorites"
  isFavorites: {
    type: Boolean,
    default: false,
  },
  songs: [SongSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Playlist", PlaylistSchema);
