require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["https://mood-music-steel.vercel.app", "http://localhost:5173"],
  }),
);

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/music", require("./routes/music"));
app.use("/api/playlists", require("./routes/playlists"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
