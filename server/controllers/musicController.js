const axios = require("axios");
const Playlist = require("../models/Playlist");

// Mood Transition Matrix
// Defines the path from a "Negative" mood to a "Positive" one
const TRANSITIONS = {
  Sad: ["Calm", "Happy"],
  Tense: ["Calm", "Happy"],
  Calm: ["Calm", "Energetic"],
  Happy: ["Happy", "Energetic"],
  Focus: ["Focus", "Calm"],
};

// Helper: Fetch videos from YouTube API (With Strict Duration Filtering)
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
        stage: stageName,
      }));
  }

  try {
    // STEP 1: Fetch a larger batch (maxResults * 2) to account for the Shorts we will delete
    const fetchCount = maxResults * 2;
    const safeQuery = encodeURIComponent(`${query} official audio`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${safeQuery}&type=video&videoCategoryId=10&maxResults=${fetchCount}&key=${API_KEY}`;

    const searchRes = await axios.get(searchUrl);

    if (!searchRes.data.items || searchRes.data.items.length === 0) return [];

    // Extract all the Video IDs from the search results
    const videoIds = searchRes.data.items
      .map((item) => item.id.videoId)
      .join(",");

    // STEP 2: Make a rapid second call to get the EXACT duration of these videos
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${API_KEY}`;
    const detailsRes = await axios.get(detailsUrl);

    // STEP 3: Filter out Shorts.
    // YouTube durations look like "PT3M45S" (3 mins 45 secs) or "PT45S" (45 secs).
    // If it doesn't contain 'M' (Minutes) or 'H' (Hours), it is under 60 seconds (a Short).
    const validVideos = detailsRes.data.items.filter((video) => {
      const duration = video.contentDetails.duration;
      return duration.includes("M") || duration.includes("H");
    });

    // Slice the array back down to the exact number requested and format it
    return validVideos.slice(0, maxResults).map((item) => ({
      id: item.id,
      title: item.snippet.title,
      image: item.snippet.thumbnails.high.url,
      artist: item.snippet.channelTitle,
      stage: stageName,
    }));
  } catch (error) {
    console.error("YouTube API Error:", error.message);
    return [];
  }
}

// @desc    Generate Playlist (Original Logic)
// @route   GET /api/music/generate
exports.generatePlaylist = async (req, res) => {
  const { mood, language, genre, type } = req.query;

  try {
    let searchQuery = "";

    if (type === "lift") {
      let regulationPath = "uplifting boost";
      switch (mood) {
        case "Sad":
          regulationPath = "uplifting calm to happy";
          break;
        case "Energetic":
          regulationPath = "calming to happy upbeat";
          break;
        case "Chill":
        case "Focused":
          regulationPath = "calm to energetic wake up";
          break;
        case "Happy":
        case "Romantic":
          regulationPath = "happy energetic party boost";
          break;
      }
      searchQuery = `${regulationPath} ${language} ${genre}`;
    } else {
      searchQuery = `${mood} ${language} ${genre}`;
    }

    // Reuse our new bulletproof function to ensure no Shorts slip through here either!
    const songs = await fetchYouTubeVideos(searchQuery, 15, "Match");

    // The older frontend component expects 'videoId' instead of 'id', so we map it back
    const formattedSongs = songs.map((song) => ({
      videoId: song.id,
      title: song.title,
      artist: song.artist,
      image: song.image,
    }));

    res.json(formattedSongs);
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
      const targetMoods = TRANSITIONS[mood] || ["Happy", "Energetic"];

      const v1 = await fetchYouTubeVideos(
        `${language} ${mood} ${genre}`,
        3,
        "Validation",
      );
      const v2 = await fetchYouTubeVideos(
        `${language} ${targetMoods[0]} ${genre}`,
        5,
        "Transition",
      );
      const v3 = await fetchYouTubeVideos(
        `${language} ${targetMoods[1] || targetMoods[0]} ${genre}`,
        6,
        "Target",
      );

      videoResults = [...v1, ...v2, ...v3];
    } else {
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
      user: req.user.id,
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
