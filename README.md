
info:
Name:Mahendran.p
contact:9791193280


# Mini SaaS Template Store

A full-stack web application that allows users to browse, search, and favorite website templates. Built with React, Node.js, Express, and MongoDB.

## Features

- **User Authentication**
  - Register new account
  - Login with username/password
  - Token-based auth with server-side session storage
  - Protected routes for authenticated users

- **Template Management**
  - Browse template catalog
  - Search templates by name or category
  - View template details with thumbnails
  - Responsive grid layout with Tailwind CSS

- **Favorites System**
  - Mark templates as favorites (authenticated users)
  - View personal favorites collection
  - Persistent favorites storage in MongoDB

## Tech Stack

### Frontend
- React 18 with Vite
- React Router v6 for routing
- Axios for API calls
- Tailwind CSS for styling
- In-memory token storage with Context API

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- CORS enabled for frontend access
- Simple token-based auth system

## Project Structure

```
client/
  ├── src/
  │   ├── auth/
  │   │   └── AuthProvider.jsx    # Auth context & token management
  │   ├── components/
  │   │   └── TemplateCard.jsx    # Template display component
  │   ├── pages/
  │   │   ├── Login.jsx          # Login form
  │   │   ├── Register.jsx       # Registration form
  │   │   ├── Templates.jsx      # Template catalog
  │   │   └── Favorites.jsx      # User's favorites
  │   ├── App.jsx                # Main app component
  │   └── main.jsx              # App entry point
  └── package.json               # Frontend dependencies

server/
  ├── index.js                  # Express server & API routes
  └── package.json              # Backend dependencies
```

## Getting Started

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or Atlas)

### Setup Backend
1. Install MongoDB locally or set up a free MongoDB Atlas cluster
2. Navigate to server directory:
   ```bash
   cd server
   npm install
   ```
3. Start the server:
   ```bash
   # With local MongoDB:
   node index.js

   # With MongoDB Atlas:
   $env:MONGODB_URI="your_atlas_connection_string"  # PowerShell
   # OR
   export MONGODB_URI="your_atlas_connection_string"  # Bash
   node index.js
   ```
   Server runs on http://localhost:3000

### Setup Frontend
1. Navigate to client directory:
   ```bash
   cd client
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:5173

## Environment Variables

### Backend (server/)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://127.0.0.1:27017/mini_saas)
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origin (default: *)

### Frontend (client/)
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3000)

## API Routes

### Public Routes
- `POST /register` - Register new user
- `POST /login` - Login and get auth token
- `GET /api/templates` - List all templates
- `GET /api/templates/:id` - Get template details

### Protected Routes (requires auth token)
- `POST /api/favorites/:templateId` - Add template to favorites
- `GET /api/favorites` - List user's favorites
- `POST /logout` - Logout (invalidate token)

## Deployment

The project is designed to be deployed to:
- Frontend: Vercel or similar static hosting
- Backend: Render or similar Node.js hosting
- Database: MongoDB Atlas

See `README_DEPLOY.md` for detailed deployment instructions.

## Development Notes

- Authentication uses simple server-side session tokens (stored in memory)
- Passwords are stored as plaintext (for demo only - use bcrypt in production)
- Frontend keeps auth token in memory (no localStorage)
- Templates are seeded automatically on first server start

## Future Improvements

- Add bcrypt password hashing
- Persist sessions in MongoDB
- Add unfavorite functionality
- Add admin panel for template management
- Add user profile management
- Implement refresh tokens
- Add rate limiting
- Add input validation middleware

## License

MIT License - feel free to use this project for learning and development.
