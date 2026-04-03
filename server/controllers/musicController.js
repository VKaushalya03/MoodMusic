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
async function fetchYouTubeVideos(query, maxResults, stageName = "Match") {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY || API_KEY.includes("YOUR_YOUTUBE_API_KEY")) {
    console.log("⚠️ Using Dummy Data");
    return Array(maxResults)
      .fill(0)
      .map((_, i) => ({
        id: `dummy_${Date.now()}_${i}`,
        title: `[${stageName}] ${query} Track ${i + 1}`,
        image: "https://via.placeholder.com/320x180.png?text=Music+Video",
        artist: "Demo Channel",
        stage: stageName, // ✅ Tagging the stage for the frontend
      }));
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query} music&type=video&videoCategoryId=10&maxResults=${maxResults}&key=${API_KEY}`;
    const response = await axios.get(url);

    return response.data.items.map((item) => ({
      id: item.id.videoId, // ✅ Fixed key for React Player
      title: item.snippet.title,
      image: item.snippet.thumbnails.high.url, // ✅ Fixed key
      artist: item.snippet.channelTitle, // ✅ Fixed key
      stage: stageName, // ✅ Tagging the stage
    }));
  } catch (error) {
    console.error("YouTube API Error:", error.message);
    return [];
  }
}

exports.generatePlaylist = async (req, res) => {
  const { mood, language, genre, type } = req.query;

  try {
    let searchQuery = "";

    // --- APPLY THE PSYCHOLOGICAL LOGIC HERE ---
    if (type === "lift") {
      let regulationPath = "uplifting boost"; // Default

      switch (mood) {
        case "Sad":
          regulationPath = "uplifting calm to happy"; // 30% Sad → 40% Calm → 30% Happy
          break;
        case "Energetic": // Tense/Angry
          regulationPath = "calming to happy upbeat"; // 30% Intense → 40% Calm → 30% Happy
          break;
        case "Chill":
        case "Focused":
          regulationPath = "calm to energetic wake up"; // 50% Calm → 50% Energetic
          break;
        case "Happy":
        case "Romantic":
          regulationPath = "happy energetic party boost"; // 50% Happy → 50% Energetic
          break;
      }
      searchQuery = `${regulationPath} ${language} ${genre} music`;
    } else {
      // "match" - Iso-Principle
      searchQuery = `${mood} ${language} ${genre} music`;
    }

    // --- CALL YOUTUBE API ---
    const youtubeRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: searchQuery,
          maxResults: 15,
          type: "video",
          videoCategoryId: "10", // 10 is the Music category
          key: process.env.YOUTUBE_API_KEY,
        },
      },
    );

    // Format the response for the frontend
    const songs = youtubeRes.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      image: item.snippet.thumbnails.high.url,
    }));

    res.json(songs);
  } catch (err) {
    console.error("Music Generation Error:", err.message);
    res.status(500).json({ msg: "Failed to generate playlist" });
  }
};
// @desc    Generate Playlist (3-Stage Logic)
// @route   POST /api/music/recommend
exports.getRecommendation = async (req, res) => {
  const { mood, language, genre, mode } = req.body;

  let videoResults = [];
  console.log(`🎵 Generating: [${mode}] ${mood} - ${language} ${genre}`);

  try {
    if (mode === "improve" || mode === "lift") {
      // === STRATEGY: ISO-PRINCIPLE MOOD REGULATION (14 Songs Total) ===
      const targetMoods = TRANSITIONS[mood] || ["Happy", "Energetic"];

      // Stage 1: Validate Current Emotion (3 songs)
      const v1 = await fetchYouTubeVideos(
        `${language} ${mood} ${genre}`,
        3,
        "Validation",
      );

      // Stage 2: The Bridge / Transition (5 songs)
      const v2 = await fetchYouTubeVideos(
        `${language} ${targetMoods[0]} ${genre}`,
        5,
        "Transition",
      );

      // Stage 3: The Target State (6 songs)
      const v3 = await fetchYouTubeVideos(
        `${language} ${targetMoods[1] || targetMoods[0]} ${genre}`,
        6,
        "Target",
      );

      videoResults = [...v1, ...v2, ...v3];
    } else {
      // === STRATEGY: EXACT MATCH ===
      videoResults = await fetchYouTubeVideos(
        `${language} ${mood} ${genre}`,
        10,
        "Match",
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
