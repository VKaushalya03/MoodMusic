const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require("crypto");
const Playlist = require("../models/Playlist");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ username, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    await new Playlist({
      user: user.id,
      name: "Favorites",
      isFavorites: true,
    }).save();

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: { id: user.id, username: user.username, email: user.email },
        });
      },
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: { id: user.id, username: user.username, email: user.email },
        });
      },
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body; // This is the Access Token (ya29...)

  try {
    // 1. Instead of verifyIdToken, we fetch user info using the Access Token
    const googleResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const { sub, name, email, picture } = googleResponse.data;

    // 2. Check if user exists in our DB
    let user = await User.findOne({ email });

    if (user) {
      // User exists: Update googleId if missing
      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
    } else {
      // User doesn't exist: Create new account
      user = new User({
        username: name,
        email: email,
        googleId: sub,
        avatar: picture,
        // No password needed for Google users
      });
      await user.save();
      await new Playlist({
        user: user.id,
        name: "Favorites",
        isFavorites: true,
      }).save();
    }

    // 3. Generate OUR App Token (JWT)
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5d" },
      (err, appToken) => {
        if (err) throw err;
        res.json({
          token: appToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
          },
        });
      },
    );
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(400).json({ msg: "Google Sign-In Failed" });
  }
};

// @desc    Update Password (Logged In User)
// @route   PUT /api/auth/updatepassword
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Get user with password field included
    const user = await User.findById(req.user.id);

    // 2. Check if user signed up with Google (no password)
    if (!user.password) {
      return res.status(400).json({
        msg: "You use Google Login. Please cannot change password here.",
      });
    }

    // 3. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // 4. Hash New Password & Save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Forgot Password (Send Email)
// @route   POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 1. Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // 2. Hash it and save to DB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes
    await user.save();

    // 3. Create Reset URL (Frontend URL)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // 4. Send Email (For DEV, we just console.log it)
    console.log("---------------------------------------");
    console.log("⚠️ DEV MODE - Password Reset Link:");
    console.log(resetUrl);
    console.log("---------------------------------------");

    // In production, use nodemailer here to send resetUrl to user.email

    res.json({
      success: true,
      data: "Email sent (Check server console for link)",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Email could not be sent");
  }
};

// @desc    Reset Password (Using Token)
// @route   PUT /api/auth/resetpassword/:resetToken
exports.resetPassword = async (req, res) => {
  try {
    // 1. Hash token from URL to match DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    // 2. Find user with valid token and time
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // Check if not expired
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // 3. Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // 4. Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, msg: "Password updated! You can now login." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
