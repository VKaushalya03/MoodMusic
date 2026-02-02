const axios = require("axios");
const Playlist = require("../models/Playlist");

// Mood Transition Matrix
// Defines the path from a "Negative" mood to a "Positive" one
const TRANSITIONS = {
  Sad: ["Calm", "Happy"], // Sad -> Calm -> Happy
  Tense: ["Calm", "Happy"], // Tense -> Calm -> Happy
  Calm: ["Calm", "Energetic"], // Calm -> Wake up
  Happy: ["Happy", "Energetic"], // Happy -> Boost
  Focus: ["Focus", "Calm"], // Keep focused
};

// Helper: Fetch videos from YouTube API
async function fetchYouTubeVideos(query, maxResults) {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  // Safety Check: If no API key, return dummy data (prevents crashing during dev)
  if (!API_KEY || API_KEY.includes("YOUR_YOUTUBE_API_KEY")) {
    console.log("⚠️ Using Dummy Data (No API Key Found)");
    return Array(maxResults)
      .fill(0)
      .map((_, i) => ({
        videoId: `dummy_${i}`,
        title: `[Demo] ${query} Song ${i + 1}`,
        thumbnail: "https://via.placeholder.com/320x180.png?text=Music+Video",
        channel: "Demo Channel",
      }));
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query} music&type=video&videoCategoryId=10&maxResults=${maxResults}&key=${API_KEY}`;
    const response = await axios.get(url);

    return response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channel: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error(
      "YouTube API Error:",
      error.response ? error.response.data : error.message,
    );
    return [];
  }
}

// @desc    Generate Playlist
// @route   POST /api/music/recommend
exports.getRecommendation = async (req, res) => {
  const { mood, language, genre, mode } = req.body;
  // mode = 'match' (default) or 'improve'

  let videoResults = [];
  console.log(`🎵 Generating: [${mode}] ${mood} - ${language} ${genre}`);

  try {
    if (mode === "improve") {
      // === STRATEGY 2: MOOD REGULATION (Transition) ===
      const targetMoods = TRANSITIONS[mood] || ["Happy"];

      // Step 1: Validate current feelings (2 songs)
      const v1 = await fetchYouTubeVideos(`${language} ${mood} ${genre}`, 2);

      // Step 2: Bridge/Transition (4 songs)
      const v2 = await fetchYouTubeVideos(
        `${language} ${targetMoods[0]} ${genre}`,
        4,
      );

      // Step 3: Target State (4 songs)
      const v3 = await fetchYouTubeVideos(
        `${language} ${targetMoods[1] || targetMoods[0]} ${genre}`,
        4,
      );

      videoResults = [...v1, ...v2, ...v3];
    } else {
      // === STRATEGY 1: ISO-PRINCIPLE (Match Mood) ===
      // Default behavior: 10 songs matching exactly how the user feels
      videoResults = await fetchYouTubeVideos(
        `${language} ${mood} ${genre}`,
        10,
      );
    }

    res.json(videoResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch music" });
  }
};

// @desc    Save Playlist
// @route   POST /api/music/save
exports.savePlaylist = async (req, res) => {
  try {
    const { name, inputs, tracks } = req.body;

    const newPlaylist = new Playlist({
      user: req.user.id, // Comes from authMiddleware
      name,
      inputs,
      tracks,
    });

    const saved = await newPlaylist.save();
    res.json(saved);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get User's Saved Playlists
// @route   GET /api/music/history
exports.getHistory = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
