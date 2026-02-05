require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

/* =========================================================
   1. UNIVERSAL CORS CONFIG (LOCAL + DOCKER)
========================================================= */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS BLOCKED:", origin);
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

/* =========================================================
   2. DEFAULT HEADERS (for extra safety)
========================================================= */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* =========================================================
   3. MIDDLEWARE
========================================================= */
app.use(express.json());

/* =========================================================
   4. ROUTES IMPORT
========================================================= */
const adminRoutes = require("./routes/Admin/adminRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const superadminAuthRoutes = require("./routes/superadmin/auth");
const superadminRoutes = require("./routes/superadmin/superadmin");
const trekRoutes = require("./routes/trekroutes");
const authRoutes = require("./routes/authroutes");
const aboutRoutes = require("./routes/aboutRoutes");

// Content routes
const blogRoutes = require("./routes/blogRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Settings / Hero / Uploads
const settingsRoutes = require("./routes/settingsRoutes");
const heroRoutes = require("./routes/heroRoutes");
// const uploadRoutes = require("./routes/uploadRoutes");

/* =========================================================
   5. ROUTES MOUNTING
========================================================= */
app.use("/api/admin", adminRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/superadmin/auth", superadminAuthRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/treks", trekRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/about", aboutRoutes);

// Mount new content routes
app.use("/api/blogs", blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contact", contactRoutes);

// Settings/Hero/Uploads
app.use("/api/settings", settingsRoutes);
app.use("/api/hero", heroRoutes);
// app.use("/api/uploads", uploadRoutes);


/* =========================================================
   6. SERVE FRONTEND IN PRODUCTION
========================================================= */
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(distPath));

  // SPA fallback
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

/* =========================================================
   7. TEST ROUTES
========================================================= */
app.get("/", (req, res) => {
  res.send("GeleTrekking backend is running.");
});

// Health check endpoint for Docker
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Backend is running" });
});

/* =========================================================
   7. ERROR HANDLING
========================================================= */
app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

/* =========================================================
   8. DATABASE CONNECTION & SERVER STARTUP
========================================================= */
const PORT = process.env.PORT || 5000;

// Build MongoDB URI dynamically
const buildMongoUri = () => {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }
  
  const username = encodeURIComponent(process.env.MONGO_USERNAME || '');
  const password = encodeURIComponent(process.env.MONGO_PASSWORD || '');
  const host = process.env.MONGO_HOST || 'mongo';
  const port = process.env.MONGO_PORT || '27017';
  const database = process.env.MONGO_DATABASE || 'geletrekking';
  const authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
  
  if (!username || !password) {
    throw new Error('MongoDB credentials not configured. Set MONGO_USERNAME and MONGO_PASSWORD or MONGO_URI');
  }
  
  return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`;
};

const startServer = async () => {
  try {
    const mongoUri = buildMongoUri();
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected.");

    // IMPORTANT: Must listen on 0.0.0.0 in Docker
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error(" MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

startServer();
