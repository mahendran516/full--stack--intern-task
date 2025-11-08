import express from "express";
import cors from "cors";

const app = express();
app.use(express.json()); // parse JSON bodies
// configure CORS origin via environment variable in production
const corsOrigin = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: corsOrigin }));

// In-memory data storage
// -------------------------
// users: { id, username, password }
const users = [];
// templates: pre-seeded list of templates
const templates = [];
// favorites: { userId, templateId, createdAt }
const favorites = [];
// sessions: token -> { userId, expiresAt }
const sessions = {};

// -------------------------
// Seed templates (run once)
// -------------------------
function seedTemplates() {
  if (templates.length) return; // already seeded
  templates.push(
    {
      id: "t1",
      name: "Landing Page",
      description: "Simple marketing landing",
      thumbnail_url: "https://cdn.prod.website-files.com/65bb7884c67879aa0d84f24e/65c0eb721ea864f342f436f8_What-are-landing-pages-and-why-do-you-need-to-use-them.jpeg",
      category: "Marketing",
    },
    {
      id: "t2",
      name: "Admin Dashboard",
      description: "Data tables and charts",
      thumbnail_url: "https://github.com/mahendran516/images/blob/main/Screenshot%202024-10-30%20124739.png?raw=true",
      category: "Admin",
    },
    {
      id: "t3",
      name: "Blog",
      description: "Blog with posts and tags",
      thumbnail_url: "https://github.com/mahendran516/images/blob/main/Screenshot%202024-10-29%20114154.png?raw=true",
      category: "Content",
    },
    {
      id: "t4",
      name: "E-commerce",
      description: "Product catalog and cart",
      thumbnail_url: "https://github.com/mahendran516/images/blob/main/Screenshot%202024-12-19%20162010.png?raw=true",
      category: "Ecommerce",
    },
    {
      id: "t5",
      name: "Portfolio",
      description: "Personal portfolio template",
      thumbnail_url: "https://tint.creativemarket.com/lqU1IZwUw4HHPPwvET5xd6aCqNrJ8n4zYIqGhcuq8BY/width:1200/height:800/gravity:nowe/rt:fill-down/el:1/czM6Ly9maWxlcy5jcmVhdGl2ZW1hcmtldC5jb20vaW1hZ2VzL3NjcmVlbnNob3RzL3Byb2R1Y3RzLzU0MDUvNTQwNTkvNTQwNTk2NzgvdjJfZGVzaWducG9ydGZvbGlvLXRlbXBsYXRlLXR5cGVmb29sLXByb21vdGlvbmFsLW8uanBnIzE3NTQzOTI3MDc?1754392707",
      category: "Portfolio",
    }
  );
}

seedTemplates();

// -------------------------
// Very small helpers
// -------------------------
let userCounter = 1; // simple incremental user id for readability
function createUserId() {
  return "u" + userCounter++;
}

// Simple token generation for demo purposes only
function createToken() {
  // Math.random + Date used only for learning/demo. Not cryptographically secure.
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Simple validators
function validUsername(u) {
  return typeof u === "string" && u.trim().length >= 3;
}
function validPassword(p) {
  return typeof p === "string" && p.length >= 4;
}

// -------------------------
// Auth middleware
// -------------------------
// Protect routes by expecting header: Authorization: Token <token>
function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header)
    return res.status(401).json({ message: "Missing Authorization header" });
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Token")
    return res.status(401).json({ message: "Invalid Authorization format" });
  const token = parts[1];
  const s = sessions[token];
  if (!s) return res.status(401).json({ message: "Invalid token" });
  if (s.expiresAt < Date.now()) {
    delete sessions[token];
    return res.status(401).json({ message: "Token expired" });
  }
  const user = users.find((x) => x.id === s.userId);
  if (!user) return res.status(401).json({ message: "User not found" });
  req.user = user; // attach user for handlers
  req.token = token;
  next();
}

// -------------------------
// Routes (small and clear)
// -------------------------

// Register a new user
// Body: { username, password }
app.post("/register", (req, res) => {
  console.log("POST /register body:", req.body);
  const { username, password } = req.body || {};
  if (!validUsername(username) || !validPassword(password)) {
    // 400 = bad request
    return res
      .status(400)
      .json({ message: "username (min 3) and password (min 4) required" });
  }
  if (users.some((u) => u.username === username)) {
    // 409 = conflict (username exists)
    return res.status(409).json({ message: "username already exists" });
  }
  // NOTE: plaintext password stored for learning only. Replace with hashing in real apps.
  const id = createUserId();
  users.push({ id, username, password });
  return res.status(201).json({ id, username });
});

// Login
// Body: { username, password }
// Response: { token, user }
app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: "username and password required" });
  const user = users.find((u) => u.username === username);
  if (!user || user.password !== password)
    return res.status(401).json({ message: "invalid credentials" });
  const token = createToken();
  const ttl = 1000 * 60 * 60 * 2; // 2 hours
  sessions[token] = { userId: user.id, expiresAt: Date.now() + ttl };
  return res.json({ token, user: { id: user.id, username: user.username } });
});

// GET /api/templates -> list all templates
app.get("/api/templates", (req, res) => {
  res.json(templates);
});

// GET /api/templates/:id -> details
app.get("/api/templates/:id", (req, res) => {
  const t = templates.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ message: "template not found" });
  res.json(t);
});

// POST /api/favorites/:templateId -> add favorite (authenticated)
app.post("/api/favorites/:templateId", authMiddleware, (req, res) => {
  const templateId = req.params.templateId;
  const template = templates.find((t) => t.id === templateId);
  if (!template) return res.status(404).json({ message: "template not found" });
  if (
    favorites.some(
      (f) => f.userId === req.user.id && f.templateId === templateId
    )
  ) {
    return res.status(409).json({ message: "already favorited" });
  }
  favorites.push({
    userId: req.user.id,
    templateId,
    createdAt: new Date().toISOString(),
  });
  return res.status(201).json({ message: "favorited" });
});

// GET /api/favorites -> list user's favorites (authenticated)
app.get("/api/favorites", authMiddleware, (req, res) => {
  const userFavs = favorites
    .filter((f) => f.userId === req.user.id)
    .map((f) => ({
      template: templates.find((t) => t.id === f.templateId),
      favoritedAt: f.createdAt,
    }));
  res.json(userFavs);
});

// POST /logout -> invalidate token (authenticated)
app.post("/logout", authMiddleware, (req, res) => {
  delete sessions[req.token];
  res.json({ message: "logged out" });
});

// Basic error handler: logs and returns 500
app.use((err, req, res, next) => {
  console.error((err && err.stack) || err);
  res.status(500).json({ message: "internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
