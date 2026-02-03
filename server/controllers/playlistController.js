const Playlist = require("../models/Playlist");

// @desc    Get all user playlists
// @route   GET /api/playlists
exports.getPlaylists = async (req, res) => {
  try {
    // Sort by created date (newest first)
    const playlists = await Playlist.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Create a new playlist
// @route   POST /api/playlists
exports.createPlaylist = async (req, res) => {
  const { name, isFavorites } = req.body;

  try {
    const newPlaylist = new Playlist({
      user: req.user.id,
      name: name || "New Playlist",
      isFavorites: isFavorites || false,
      songs: [],
    });

    const playlist = await newPlaylist.save();
    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Rename a playlist
// @route   PUT /api/playlists/:id
exports.renamePlaylist = async (req, res) => {
  const { name } = req.body;

  try {
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) return res.status(404).json({ msg: "Playlist not found" });

    // Ensure user owns this playlist
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    playlist.name = name;
    await playlist.save();

    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) return res.status(404).json({ msg: "Playlist not found" });

    // Ensure user owns this playlist
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Prevent deleting the default "Favorites" list if you want to enforce that rule
    // if (playlist.isFavorites) return res.status(400).json({ msg: "Cannot delete Favorites list" });

    await playlist.deleteOne();
    res.json({ msg: "Playlist removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Add a song to a playlist
// @route   POST /api/playlists/:id/songs
exports.addSongToPlaylist = async (req, res) => {
  const { videoId, title, artist, image } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) return res.status(404).json({ msg: "Playlist not found" });
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Check if song already exists
    const exists = playlist.songs.find((song) => song.videoId === videoId);
    if (exists) {
      return res.status(400).json({ msg: "Song already in playlist" });
    }

    // Add new song
    playlist.songs.unshift({ videoId, title, artist, image });
    await playlist.save();

    res.json(playlist.songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Remove a song from a playlist
// @route   DELETE /api/playlists/:id/songs/:videoId
exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) return res.status(404).json({ msg: "Playlist not found" });
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Filter out the song
    playlist.songs = playlist.songs.filter(
      (song) => song.videoId !== req.params.videoId,
    );

    await playlist.save();
    res.json(playlist.songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
