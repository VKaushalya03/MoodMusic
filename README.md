# 🎶 MoodMusic

MoodMusic is a mood-based music streaming platform that aggregates content via the YouTube Data API. It helps users discover, save, and play music tailored to their current feelings using a polished, dark-themed UI built with React + Vite and a Node/Express + MongoDB backend.

---

## ✨ Key Features

- 🎵 **Mood-Based Discovery** — Search by mood/genre with auto-complete suggestions (Google suggest JSONP).
- 🎧 **Custom Web Player** — Persistent footer player using the YouTube IFrame API with custom controls: Play, Pause, Seek, Volume, Loop, Shuffle. See [`Player`](client/src/components/Player.jsx).
- 📚 **Personal Library** — Create, rename, delete playlists and store tracks per user. See [`playlistController`](server/controllers/playlistController.js).
- ❤️ **Favorites System** — One-click Heart button that auto-creates a Favorites playlist when missing. See toggle logic in [`Player`](client/src/components/Player.jsx) and automatic creation in [`authController.registerUser`](server/controllers/authController.js).
- 📱 **Fully Responsive** — Desktop + Mobile ready, dark UI using Tailwind CSS.

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwindcss&logoColor=fff)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=fff)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=fff)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=fff)

- Frontend: React, Vite, Tailwind CSS, Lucide React (icons), Axios, react-hot-toast. See [`client/src/App.jsx`](client/src/App.jsx) and [`PlayerProvider`](client/src/context/PlayerContext.jsx).
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth. See [`server/server.js`](server/server.js) and database connection at [`server/config/db.js`](server/config/db.js).
- External APIs: YouTube Data API v3 (search) and Google Suggest (JSONP) — logic in [`server/controllers/musicController.js`](server/controllers/musicController.js) and [`client/src/pages/Discover.jsx`](client/src/pages/Discover.jsx).

---

## 🔐 Environment Variables

Create .env files for client (Vite) and server.

Server (.env)

- PORT (optional, default 5000)
- MONGO_URI — MongoDB connection string
- JWT_SECRET — JSON Web Token secret
- YOUTUBE_API_KEY — YouTube Data API v3 key
- GOOGLE_CLIENT_ID — Google OAuth client id

Client (Vite) — create a `.env` or `.env.local` inside `client/` with:

- VITE_GOOGLE_CLIENT_ID (or use the one in code during dev)

Example from workspace:

- See server env values at [`server/.env`](server/.env)

---

## 🚀 Installation & Local Setup

1. Clone repo:
   git clone <your-repo-url>
2. Server
   - cd server
   - npm install
   - create `.env` (see Environment Variables)
   - npm start
   - Default: http://localhost:5000
   - Entry: [`server/server.js`](server/server.js)
3. Client
   - cd client
   - npm install
   - create client env if needed (Vite)
   - npm run dev
   - Default: http://localhost:5173
   - Entry: [`client/index.html`](client/index.html) and [`client/src/main.jsx`](client/src/main.jsx)

Notes:

- The backend registers a default "Favorites" playlist on user signup. See [`authController.registerUser`](server/controllers/authController.js).
- YouTube API key usage lives in [`server/controllers/musicController.js`](server/controllers/musicController.js) and the client search helper in [`client/src/pages/Discover.jsx`](client/src/pages/Discover.jsx).

---

## 🔌 API Endpoints (Summary)

Auth

- POST /api/auth/register — register user (creates default Favorites) — handler: [`authController.registerUser`](server/controllers/authController.js)
- POST /api/auth/login — login user — handler: [`authController.loginUser`](server/controllers/authController.js)
- POST /api/auth/google — Google OAuth (access token) — handler: [`authController.googleLogin`](server/controllers/authController.js)
- GET /api/auth/me — get profile (protected) — handler: [`authController.getUserProfile`](server/controllers/authController.js)
- PUT /api/auth/updatepassword — change password (protected) — handler: [`authController.updatePassword`](server/controllers/authController.js)
- POST /api/auth/forgotpassword — generate reset token — handler: [`authController.forgotPassword`](server/controllers/authController.js)
- PUT /api/auth/resetpassword/:resetToken — reset using token — handler: [`authController.resetPassword`](server/controllers/authController.js)

Music

- POST /api/music/recommend — generate recommendations using YouTube (public) — handler: [`musicController.getRecommendation`](server/controllers/musicController.js)
- POST /api/music/save — save generated playlist (protected) — handler: [`musicController.savePlaylist`](server/controllers/musicController.js)
- GET /api/music/history — get user's history/saved playlists — handler: [`musicController.getHistory`](server/controllers/musicController.js)

Playlists (protected)

- GET /api/playlists — list user playlists — handler: [`playlistController.getPlaylists`](server/controllers/playlistController.js)
- POST /api/playlists — create playlist — handler: [`playlistController.createPlaylist`](server/controllers/playlistController.js)
- PUT /api/playlists/:id — rename playlist — handler: [`playlistController.renamePlaylist`](server/controllers/playlistController.js)
- DELETE /api/playlists/:id — delete playlist — handler: [`playlistController.deletePlaylist`](server/controllers/playlistController.js)
- POST /api/playlists/:id/songs — add song — handler: [`playlistController.addSongToPlaylist`](server/controllers/playlistController.js)
- DELETE /api/playlists/:id/songs/:videoId — remove song — handler: [`playlistController.removeSongFromPlaylist`](server/controllers/playlistController.js)

Authentication middleware:

- [`authMiddleware`](server/middleware/authMiddleware.js)

---

## 🧭 Key Files & Components

- Client
  - [`client/src/main.jsx`](client/src/main.jsx)
  - [`client/src/App.jsx`](client/src/App.jsx)
  - [`client/src/context/PlayerContext.jsx`](client/src/context/PlayerContext.jsx) — `PlayerProvider`
  - [`client/src/components/Player.jsx`](client/src/components/Player.jsx) — custom YouTube player
  - [`client/src/pages/Discover.jsx`](client/src/pages/Discover.jsx) — search + suggestions + add-to-playlist modal
  - [`client/src/components/AddToPlaylistModal.jsx`](client/src/components/AddToPlaylistModal.jsx)
  - Styling/config: [`client/tailwind.config.js`](client/tailwind.config.js), [`client/postcss.config.js`](client/postcss.config.js), [`client/vite.config.js`](client/vite.config.js)

- Server
  - [`server/server.js`](server/server.js)
  - DB: [`server/config/db.js`](server/config/db.js)
  - Auth: [`server/controllers/authController.js`](server/controllers/authController.js)
  - Music: [`server/controllers/musicController.js`](server/controllers/musicController.js)
  - Playlists: [`server/controllers/playlistController.js`](server/controllers/playlistController.js)
  - Models: [`server/models/User.js`](server/models/User.js), [`server/models/Playlist.js`](server/models/Playlist.js)
  - Routes: [`server/routes/auth.js`](server/routes/auth.js), [`server/routes/music.js`](server/routes/music.js), [`server/routes/playlists.js`](server/routes/playlists.js)
  - Middleware: [`server/middleware/authMiddleware.js`](server/middleware/authMiddleware.js)

---

## 🖼️ Screenshots

- ![Dashboard Screenshot](path/to/dashboard.png)
- ![Discover Screenshot](path/to/discover.png)
- ![Player Screenshot](path/to/player.png)
- ![Library Screenshot](path/to/library.png)

(Replace placeholders with real screenshots in the `client/public/` or `docs/` folder.)

---

## ✅ Notes & Tips

- The app auto-creates a Favorites playlist on registration for UX ease. See [`authController.registerUser`](server/controllers/authController.js).
- The client uses [`@react-oauth/google`](client/package.json) and expects a Google client id in [`client/src/main.jsx`](client/src/main.jsx).
- For development without a YouTube API key, the server contains a dummy fallback in [`server/controllers/musicController.js`](server/controllers/musicController.js).

---

## 📁 Workspace Quick Links

- [/.gitignore](.gitignore)
- [client/.gitignore](client/.gitignore)
- [client/eslint.config.js](client/eslint.config.js)
- [client/index.html](client/index.html)
- [client/package.json](client/package.json)
- [client/postcss.config.js](client/postcss.config.js)
- [client/README.md](client/README.md)
- [client/tailwind.config.js](client/tailwind.config.js)
- [client/vite.config.js](client/vite.config.js)
- [client/src/App.css](client/src/App.css)
- [client/src/App.jsx](client/src/App.jsx)
- [client/src/index.css](client/src/index.css)
- [client/src/main.jsx](client/src/main.jsx)
- [client/src/components/AddToPlaylistModal.jsx](client/src/components/AddToPlaylistModal.jsx)
- [client/src/components/Player.jsx](client/src/components/Player.jsx)
- [client/src/components/Sidebar.jsx](client/src/components/Sidebar.jsx)
- [client/src/context/PlayerContext.jsx](client/src/context/PlayerContext.jsx)
- [client/src/pages/Discover.jsx](client/src/pages/Discover.jsx)
- [client/src/pages/Library.jsx](client/src/pages/Library.jsx)
- [client/src/pages/Login.jsx](client/src/pages/Login.jsx)
- [client/src/pages/Profile.jsx](client/src/pages/Profile.jsx)
- [client/src/pages/Register.jsx](client/src/pages/Register.jsx)
- [server/.gitignore](server/.gitignore)
- [server/.env](server/.env)
- [server/package.json](server/package.json)
- [server/server.js](server/server.js)
- [server/config/db.js](server/config/db.js)
- [server/controllers/playlistController.js](server/controllers/playlistController.js)
- [server/controllers/musicController.js](server/controllers/musicController.js)
- [server/controllers/authController.js](server/controllers/authController.js)
- [server/middleware/authMiddleware.js](server/middleware/authMiddleware.js)
- [server/models/Playlist.js](server/models/Playlist.js)
- [server/models/User.js](server/models/User.js)
- [server/routes/auth.js](server/routes/auth.js)
- [server/routes/music.js](server/routes/music.js)
- [server/routes/playlists.js](server/routes/playlists.js)

---

## 📄 License

Add your preferred license (MIT, Apache-2.0, etc.) to the repo.

---

If you want, I can:

- Add a simple deployment checklist,
- Create a sample `.env.example` for both client and server,
- Or scaffold screenshot assets and a CONTRIBUTING.md.

```// filepath: README.md
# 🎶 MoodMusic

MoodMusic is a mood-based music streaming platform that aggregates content via the YouTube Data API. It helps users discover, save, and play music tailored to their current feelings using a polished, dark-themed UI built with React + Vite and a Node/Express + MongoDB backend.

---

## ✨ Key Features

- 🎵 **Mood-Based Discovery** — Search by mood/genre with auto-complete suggestions (Google suggest JSONP).
- 🎧 **Custom Web Player** — Persistent footer player using the YouTube IFrame API with custom controls: Play, Pause, Seek, Volume, Loop, Shuffle. See [`Player`](client/src/components/Player.jsx).
- 📚 **Personal Library** — Create, rename, delete playlists and store tracks per user. See [`playlistController`](server/controllers/playlistController.js).
- ❤️ **Favorites System** — One-click Heart button that auto-creates a Favorites playlist when missing. See toggle logic in [`Player`](client/src/components/Player.jsx) and automatic creation in [`authController.registerUser`](server/controllers/authController.js).
- 📱 **Fully Responsive** — Desktop + Mobile ready, dark UI using Tailwind CSS.

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwindcss&logoColor=fff)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=fff)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=fff)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=fff)

- Frontend: React, Vite, Tailwind CSS, Lucide React (icons), Axios, react-hot-toast. See [`client/src/App.jsx`](client/src/App.jsx) and [`PlayerProvider`](client/src/context/PlayerContext.jsx).
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth. See [`server/server.js`](server/server.js) and database connection at [`server/config/db.js`](server/config/db.js).
- External APIs: YouTube Data API v3 (search) and Google Suggest (JSONP) — logic in [`server/controllers/musicController.js`](server/controllers/musicController.js) and [`client/src/pages/Discover.jsx`](client/src/pages/Discover.jsx).

---

## 🔐 Environment Variables

Create .env files for client (Vite) and server.

Server (.env)
- PORT (optional, default 5000)
- MONGO_URI — MongoDB connection string
- JWT_SECRET — JSON Web Token secret
- YOUTUBE_API_KEY — YouTube Data API v3 key
- GOOGLE_CLIENT_ID — Google OAuth client id

Client (Vite) — create a `.env` or `.env.local` inside `client/` with:
- VITE_GOOGLE_CLIENT_ID (or use the one in code during dev)

Example from workspace:
- See server env values at [`server/.env`](server/.env)

---

## 🚀 Installation & Local Setup

1. Clone repo:
   git clone <your-repo-url>
2. Server
   - cd server
   - npm install
   - create `.env` (see Environment Variables)
   - npm start
   - Default: http://localhost:5000
   - Entry: [`server/server.js`](server/server.js)
3. Client
   - cd client
   - npm install
   - create client env if needed (Vite)
   - npm run dev
   - Default: http://localhost:5173
   - Entry: [`client/index.html`](client/index.html) and [`client/src/main.jsx`](client/src/main.jsx)

Notes:
- The backend registers a default "Favorites" playlist on user signup. See [`authController.registerUser`](server/controllers/authController.js).
- YouTube API key usage lives in [`server/controllers/musicController.js`](server/controllers/musicController.js) and the client search helper in [`client/src/pages/Discover.jsx`](client/src/pages/Discover.jsx).

---

## 🔌 API Endpoints (Summary)

Auth
- POST /api/auth/register — register user (creates default Favorites) — handler: [`authController.registerUser`](server/controllers/authController.js)
- POST /api/auth/login — login user — handler: [`authController.loginUser`](server/controllers/authController.js)
- POST /api/auth/google — Google OAuth (access token) — handler: [`authController.googleLogin`](server/controllers/authController.js)
- GET /api/auth/me — get profile (protected) — handler: [`authController.getUserProfile`](server/controllers/authController.js)
- PUT /api/auth/updatepassword — change password (protected) — handler: [`authController.updatePassword`](server/controllers/authController.js)
- POST /api/auth/forgotpassword — generate reset token — handler: [`authController.forgotPassword`](server/controllers/authController.js)
- PUT /api/auth/resetpassword/:resetToken — reset using token — handler: [`authController.resetPassword`](server/controllers/authController.js)

Music
- POST /api/music/recommend — generate recommendations using YouTube (public) — handler: [`musicController.getRecommendation`](server/controllers/musicController.js)
- POST /api/music/save — save generated playlist (protected) — handler: [`musicController.savePlaylist`](server/controllers/musicController.js)
- GET /api/music/history — get user's history/saved playlists — handler: [`musicController.getHistory`](server/controllers/musicController.js)

Playlists (protected)
- GET /api/playlists — list user playlists — handler: [`playlistController.getPlaylists`](server/controllers/playlistController.js)
- POST /api/playlists — create playlist — handler: [`playlistController.createPlaylist`](server/controllers/playlistController.js)
- PUT /api/playlists/:id — rename playlist — handler: [`playlistController.renamePlaylist`](server/controllers/playlistController.js)
- DELETE /api/playlists/:id — delete playlist — handler: [`playlistController.deletePlaylist`](server/controllers/playlistController.js)
- POST /api/playlists/:id/songs — add song — handler: [`playlistController.addSongToPlaylist`](server/controllers/playlistController.js)
- DELETE /api/playlists/:id/songs/:videoId — remove song — handler: [`playlistController.removeSongFromPlaylist`](server/controllers/playlistController.js)

Authentication middleware:
- [`authMiddleware`](server/middleware/authMiddleware.js)

---

## 🧭 Key Files & Components

- Client
  - [`client/src/main.jsx`](client/src/main.jsx)
  - [`client/src/App.jsx`](client/src/App.jsx)
  - [`client/src/context/PlayerContext.jsx`](client/src/context/PlayerContext.jsx) — `PlayerProvider`
  - [`client/src/components/Player.jsx`](client/src/components/Player.jsx) — custom YouTube player
  - [`client/src/pages/Discover.jsx`](client/src/pages/Discover.jsx) — search + suggestions + add-to-playlist modal
  - [`client/src/components/AddToPlaylistModal.jsx`](client/src/components/AddToPlaylistModal.jsx)
  - Styling/config: [`client/tailwind.config.js`](client/tailwind.config.js), [`client/postcss.config.js`](client/postcss.config.js), [`client/vite.config.js`](client/vite.config.js)

- Server
  - [`server/server.js`](server/server.js)
  - DB: [`server/config/db.js`](server/config/db.js)
  - Auth: [`server/controllers/authController.js`](server/controllers/authController.js)
  - Music: [`server/controllers/musicController.js`](server/controllers/musicController.js)
  - Playlists: [`server/controllers/playlistController.js`](server/controllers/playlistController.js)
  - Models: [`server/models/User.js`](server/models/User.js), [`server/models/Playlist.js`](server/models/Playlist.js)
  - Routes: [`server/routes/auth.js`](server/routes/auth.js), [`server/routes/music.js`](server/routes/music.js), [`server/routes/playlists.js`](server/routes/playlists.js)
  - Middleware: [`server/middleware/authMiddleware.js`](server/middleware/authMiddleware.js)

---

## 🖼️ Screenshots

- ![Dashboard Screenshot](path/to/dashboard.png)
- ![Discover Screenshot](path/to/discover.png)
- ![Player Screenshot](path/to/player.png)
- ![Library Screenshot](path/to/library.png)

(Replace placeholders with real screenshots in the `client/public/` or `docs/` folder.)

---

## ✅ Notes & Tips

- The app auto-creates a Favorites playlist on registration for UX ease. See [`authController.registerUser`](server/controllers/authController.js).
- The client uses [`@react-oauth/google`](client/package.json) and expects a Google client id in [`client/src/main.jsx`](client/src/main.jsx).
- For development without a YouTube API key, the server contains a dummy fallback in [`server/controllers/musicController.js`](server/controllers/musicController.js).

---

## 📁 Workspace Quick Links

- [/.gitignore](.gitignore)
- [client/.gitignore](client/.gitignore)
- [client/eslint.config.js](client/eslint.config.js)
- [client/index.html](client/index.html)
- [client/package.json](client/package.json)
- [client/postcss.config.js](client/postcss.config.js)
- [client/README.md](client/README.md)
- [client/tailwind.config.js](client/tailwind.config.js)
- [client/vite.config.js](client/vite.config.js)
- [client/src/App.css](client/src/App.css)
- [client/src/App.jsx](client/src/App.jsx)
- [client/src/index.css](client/src/index.css)
- [client/src/main.jsx](client/src/main.jsx)
- [client/src/components/AddToPlaylistModal.jsx](client/src/components/AddToPlaylistModal.jsx)
- [client/src/components/Player.jsx](client/src/components/Player.jsx)
- [client/src/components/Sidebar.jsx](client/src/components/Sidebar.jsx)
- [client/src/context/PlayerContext.jsx](client/src/context/PlayerContext.jsx)
- [client/src/pages/Discover.jsx](client/src/pages/Discover.jsx)
- [client/src/pages/Library.jsx](client/src/pages/Library.jsx)
- [client/src/pages/Login.jsx](client/src/pages/Login.jsx)
- [client/src/pages/Profile.jsx](client/src/pages/Profile.jsx)
- [client/src/pages/Register.jsx](client/src/pages/Register.jsx)
- [server/.gitignore](server/.gitignore)
- [server/.env](server/.env)
- [server/package.json](server/package.json)
- [server/server.js](server/server.js)
- [server/config/db.js](server/config/db.js)
- [server/controllers/playlistController.js](server/controllers/playlistController.js)
- [server/controllers/musicController.js](server/controllers/musicController.js)
- [server/controllers/authController.js](server/controllers/authController.js)
- [server/middleware/authMiddleware.js](server/middleware/authMiddleware.js)
- [server/models/Playlist.js](server/models/Playlist.js)
- [server/models/User.js](server/models/User.js)
- [server/routes/auth.js](server/routes/auth.js)
- [server/routes/music.js](server/routes/music.js)
- [server/routes/playlists.js](server/routes/playlists.js)

---

## 📄 License

Add your preferred license (MIT, Apache-2.0, etc.) to the repo.

---

If you want, I can:
- Add a simple deployment checklist,
- Create a sample `.env.example` for both client and server,
- Or scaffold screenshot assets and a CONTRIBUTING.md.
```
