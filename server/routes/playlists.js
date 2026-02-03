const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getPlaylists,
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} = require("../controllers/playlistController");

// All routes are protected by 'auth' middleware
router.get("/", auth, getPlaylists);
router.post("/", auth, createPlaylist);
router.put("/:id", auth, renamePlaylist);
router.delete("/:id", auth, deletePlaylist);

// Song management within playlists
router.post("/:id/songs", auth, addSongToPlaylist);
router.delete("/:id/songs/:videoId", auth, removeSongFromPlaylist);

module.exports = router;
