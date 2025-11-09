import express from "express";
import cors from "cors";
import mongoose from 'mongoose'

const app = express();
app.use(express.json()); // parse JSON bodies
// configure CORS origin via environment variable in production
const corsOrigin = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: corsOrigin }));

// -------------------------
// MongoDB models (mongoose)
// -------------------------
// We'll persist Users, Templates and Favorites in MongoDB.
// For simplicity we keep sessions in memory (opaque tokens) as before.

const { Schema } = mongoose

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true })

const templateSchema = new Schema({
  tid: { type: String, required: true, unique: true }, // e.g. 't1'
  name: String,
  description: String,
  thumbnail_url: String,
  category: String
}, { timestamps: true })

const favoriteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  templateTid: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() }
})

const User = mongoose.model('User', userSchema)
const Template = mongoose.model('Template', templateSchema)
const Favorite = mongoose.model('Favorite', favoriteSchema)

// sessions: token -> { userId, expiresAt } (in-memory)
const sessions = {}

// -------------------------
// Seed templates (run once)
// -------------------------
// Seed templates into MongoDB if not present
async function seedTemplates() {
  const count = await Template.countDocuments()
  if (count > 0) return

  const docs = [
    {
      tid: 't1',
      name: 'Landing Page',
      description: 'Simple marketing landing',
      thumbnail_url: 'https://cdn.prod.website-files.com/65bb7884c67879aa0d84f24e/65c0eb721ea864f342f436f8_What-are-landing-pages-and-why-do-you-need-to-use-them.jpeg',
      category: 'Marketing'
    },
    { tid: 't2', name: 'Admin Dashboard', description: 'Data tables and charts', thumbnail_url: 'https://github.com/mahendran516/images/blob/main/Screenshot%202024-10-30%20124739.png?raw=true', category: 'Admin' },
    { tid: 't3', name: 'Blog', description: 'Blog with posts and tags', thumbnail_url: 'https://github.com/mahendran516/images/blob/main/Screenshot%202024-10-29%20114154.png?raw=true', category: 'Content' },
    { tid: 't4', name: 'E-commerce', description: 'Product catalog and cart', thumbnail_url: 'https://github.com/mahendran516/images/blob/main/Screenshot%202024-12-19%20162010.png?raw=true', category: 'Ecommerce' },
    { tid: 't5', name: 'Portfolio', description: 'Personal portfolio template', thumbnail_url: 'https://tint.creativemarket.com/lqU1IZwUw4HHPPwvET5xd6aCqNrJ8n4zYIqGhcuq8BY/width:1200/height:800/gravity:nowe/rt:fill-down/el:1/czM6Ly9maWxlcy5jcmVhdGl2ZW1hcmtldC5jb20vaW1hZ2VzL3NjcmVlbnNob3RzL3Byb2R1Y3RzLzU0MDUvNTQwNTkvNTQwNTk2NzgvdjJfZGVzaWducG9ydGZvbGlvLXRlbXBsYXRlLXR5cGVmb29sLXByb21vdGlvbmFsLW8uanBnIzE3NTQzOTI3MDc?1754392707', category: 'Portfolio' }
  ]

  await Template.insertMany(docs)
  console.log('Seeded templates')
}

// -------------------------
// Small helpers
// -------------------------
// Simple token generation for demo purposes only
function createToken() {
  // Math.random + Date used only for learning/demo. Not cryptographically secure.
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Simple validators
function validUsername(u) {
  return typeof u === 'string' && u.trim().length >= 3
}
function validPassword(p) {
  return typeof p === 'string' && p.length >= 4
}

// -------------------------
// Auth middleware
// -------------------------
// Protect routes by expecting header: Authorization: Token <token>
async function authMiddleware(req, res, next) {
  try {
    const header = req.headers['authorization']
    if (!header) return res.status(401).json({ message: 'Missing Authorization header' })
    const parts = header.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Token') return res.status(401).json({ message: 'Invalid Authorization format' })
    const token = parts[1]
    const s = sessions[token]
    if (!s) return res.status(401).json({ message: 'Invalid token' })
    if (s.expiresAt < Date.now()) {
      delete sessions[token]
      return res.status(401).json({ message: 'Token expired' })
    }
    const user = await User.findById(s.userId).lean()
    if (!user) return res.status(401).json({ message: 'User not found' })
    req.user = user // attach user for handlers
    req.token = token
    return next()
  } catch (err) {
    console.error('authMiddleware error', err)
    return res.status(500).json({ message: 'internal server error' })
  }
}

// -------------------------
// Routes (small and clear)
// -------------------------

// Register a new user
// Body: { username, password }
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (!validUsername(username) || !validPassword(password)) {
      return res.status(400).json({ message: 'username (min 3) and password (min 4) required' })
    }
    const exists = await User.findOne({ username }).lean()
    if (exists) return res.status(409).json({ message: 'username already exists' })
    // NOTE: plaintext password stored for learning only. Replace with hashing in real apps.
    const user = await User.create({ username, password })
    return res.status(201).json({ id: user._id, username: user.username })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'internal server error' })
  }
})

// Login
// Body: { username, password }
// Response: { token, user }
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ message: 'username and password required' })
    const user = await User.findOne({ username }).lean()
    if (!user || user.password !== password) return res.status(401).json({ message: 'invalid credentials' })
    const token = createToken()
    const ttl = 1000 * 60 * 60 * 2 // 2 hours
    sessions[token] = { userId: user._id.toString(), expiresAt: Date.now() + ttl }
    return res.json({ token, user: { id: user._id, username: user.username } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'internal server error' })
  }
})

// GET /api/templates -> list all templates
app.get('/api/templates', async (req, res) => {
  try {
    const docs = await Template.find().lean()
    // map tid -> id for frontend compatibility
    const out = docs.map(d => ({ id: d.tid, name: d.name, description: d.description, thumbnail_url: d.thumbnail_url, category: d.category }))
    res.json(out)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'internal server error' })
  }
})

// GET /api/templates/:id -> details
app.get('/api/templates/:id', async (req, res) => {
  try {
    const tid = req.params.id
    const t = await Template.findOne({ tid }).lean()
    if (!t) return res.status(404).json({ message: 'template not found' })
    return res.json({ id: t.tid, name: t.name, description: t.description, thumbnail_url: t.thumbnail_url, category: t.category })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'internal server error' })
  }
})

// POST /api/favorites/:templateId -> add favorite (authenticated)
app.post('/api/favorites/:templateId', authMiddleware, async (req, res) => {
  try {
    const templateId = req.params.templateId
    const template = await Template.findOne({ tid: templateId }).lean()
    if (!template) return res.status(404).json({ message: 'template not found' })
    const exists = await Favorite.findOne({ userId: req.user._id, templateTid: templateId }).lean()
    if (exists) return res.status(409).json({ message: 'already favorited' })
    await Favorite.create({ userId: req.user._id, templateTid: templateId })
    return res.status(201).json({ message: 'favorited' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'internal server error' })
  }
})

// GET /api/favorites -> list user's favorites (authenticated)
app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.user._id }).lean()
    const out = []
    for (const f of favs) {
      const t = await Template.findOne({ tid: f.templateTid }).lean()
      if (t) out.push({ template: { id: t.tid, name: t.name, description: t.description, thumbnail_url: t.thumbnail_url, category: t.category }, favoritedAt: f.createdAt })
    }
    res.json(out)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'internal server error' })
  }
})

// POST /logout -> invalidate token (authenticated)
app.post("/logout", authMiddleware, (req, res) => {
  delete sessions[req.token];
  res.json({ message: "logged out" });
});

// Basic error handler: logs and returns 500
app.use((err, req, res, next) => {
  console.error((err && err.stack) || err)
  res.status(500).json({ message: 'internal server error' })
})

// Connect to MongoDB and start server
async function start() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini_saas'
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')
  await seedTemplates()
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}

start().catch(err => {
  console.error('Failed to start server', err)
  process.exit(1)
})
