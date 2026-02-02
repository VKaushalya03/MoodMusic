const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    // Force Node DNS resolver to use a public DNS server if local resolver
    // refuses SRV queries. This helps when the system DNS blocks UDP queries
    // that the MongoDB driver uses for mongodb+srv URIs.
    try {
      dns.setServers(["8.8.8.8"]);
    } catch (e) {
      // non-fatal
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
