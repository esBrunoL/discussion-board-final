
This project was created with the assistance of Copilot AI with Claude Sonnet 4 model.
Thru the prompt:
"
## Project Overview  
Create a full-stack Discussion Board application with:  
- Frontend in React (HTML, CSS, JavaScript)  
- Backend in Java using Spring Boot  
- MongoDB for data storage  
- GitHub for version control  
- Visual Studio Code as the IDE  

---

## Functional Requirements  

### 1. User Authentication  
1. **Registration**  
   - Endpoint: `POST /api/auth/register`  
   - Payload:  
     - `email` (unique, valid email)  
     - `password` (min. 8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit; encrypted at rest)  
     - `firstName`  
     - `lastName`  
     - `phoneNumber` (10 digits)  
   - Server validates input, hashes password, stores user in MongoDB.  

2. **Login**  
   - Endpoint: `POST /api/auth/login`  
   - Payload: `email`, `password`  
   - On success, issues a JWT for subsequent requests.  

3. **Password Reset**  
   - “I forgot my password” button on login page  
   - Endpoint: `POST /api/auth/forgot-password`  
   - Payload: `email`, `phoneNumber`  
   - If matched, allow setting a new password at `POST /api/auth/reset-password`.  

### 2. Discussion Subjects  
1. **List Subjects**  
   - Endpoint: `GET /api/subjects?page={n}&size=10`  
   - Returns newest 10 subjects with pagination.  
   - Each item: `title`, `authorEmail`, `createdAt`.  

2. **Create Subject**  
   - Endpoint: `POST /api/subjects`  
   - Payload:  
     - `title` (≤ 100 chars)  
     - `description` (≤ 1000 chars)  
   - Adds `authorEmail` and timestamp server-side.  

3. **View Subject Details**  
   - Endpoint: `GET /api/subjects/{subjectId}`  
   - Returns subject metadata plus its comments.  

### 3. Comments  
- Endpoint: `POST /api/subjects/{subjectId}/comments`  
- Payload:  
  - `text` (≤ 244 chars)  
- Server attaches `authorEmail` and timestamp.  
- Flat structure (no replies-to-replies).

---

## Data Models (MongoDB Schemas)  

| Schema   | Fields                                            |
|----------|---------------------------------------------------|
| **User** | `firstName`; `lastName`; `email`; `passwordHash`; `phoneNumber` |
| **Subject** | `title`; `description`; `authorEmail`; `createdAt`        |
| **Comment** | `subjectId`; `text`; `authorEmail`; `createdAt`           |

---

## Frontend Structure  
- **Pages/Routes**  
  1. `/login`  
  2. `/register`  
  3. `/forgot-password`  
  4. `/subjects` (listing + pagination)  
  5. `/subjects/new`  
  6. `/subjects/:id` (detail + comments)  

- **State Management**  
  - React Context or Redux for auth token and user info.  
  - Fetch subjects and comments via `fetch` or `axios`.  

- **Styling**  
  - CSS Modules or styled-components.  
  - Responsive layout with full-screen list, scroll as needed.  

---

## Backend Structure  
- **Packages**  
  - `com.example.discussionboard.auth`  
  - `com.example.discussionboard.users`  
  - `com.example.discussionboard.subjects`  
  - `com.example.discussionboard.comments`  
- **Security**  
  - Use Spring Security for JWT filter.  
  - Input validation with Hibernate Validator.  
- **Documentation**  
  - Swagger/OpenAPI for all endpoints.  

---

## Project Setup & Documentation  
1. **Root README.md**  
   - Project overview  
   - Prerequisites (Java, Node.js, MongoDB)  
   - Setup and run instructions  

2. **Folder-level README.md**  
   - Purpose of each module (`/frontend`, `/backend`)  
   - How to build, test, and deploy that module  

3. **Code Comments**  
   - Javadoc for Java classes and methods  
   - Inline comments for complex logic in both JS and Java  

---

## Suggestions for Further Improvements  
- Add unit and integration tests (JUnit, React Testing Library).  
- Implement role-based access (e.g., admin can delete subjects/comments).  
- Introduce real-time updates with WebSockets or Server-Sent Events.  
- Provide search/filtering on subjects (by keyword, author, date).  
- Configure GitHub Actions to automate linting, testing, and deployment.  
- Use environment variables (`.env`) for secrets (JWT key, DB URI).  
- Implement rate limiting on APIs to prevent abuse.  
- Add pagination controls on the frontend (next/previous buttons with page numbers).

"

After the first creation, I had to switch the languages and frameworks to make it run.
I realized that my computer, which runs the ARMx64 windows, does not deals well with the frameworks requested on the begging, so made some updates with more AI assistance and learning each step.  Check my updates at (## Updates made by Bruno Lobo (Main developer))


# Discussion Board Application

A full-stack discussion board application built with Next.js, React, and MongoDB with advanced features including user authentication, like/dislike system, and phone number registration.

## 🚀 Features

### Core Features
- **User Authentication**: Secure register/login system with phone number support
- **Discussion Topics**: Create and browse discussion subjects
- **Threaded Comments**: Multi-level comment system with nested replies
- **Like/Dislike System**: Interactive voting on topics and comments
- **Phone Registration**: Optional phone number field for password recovery
- **Responsive Design**: Mobile-first responsive UI
- **Real-time Updates**: Live updates for likes/dislikes


## Updates made by Bruno Lobo (Main developer)
### New Features Added (Latest Update)
- ✅ **Phone Number Registration**: Optional phone field in user registration
- ✅ **Like/Dislike System**: Vote on topics and comments with smart counter logic
- ✅ **User Vote Tracking**: Each user can only vote once per item
- ✅ **Vote Switching**: Change from like to dislike and vice versa
- ✅ **Visual Feedback**: Clear indication of user's vote status
- ✅ **MongoDB Integration**: Full database integration with proper schema

## 📋 Complete Setup Instructions

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (free tier works)
- Git installed

### 1. Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/esBrunoL/discussion-board-final.git
cd DiscussionBoard

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Atlas Connection (replace with your actual credentials)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/discussion_board
```

**Getting MongoDB Atlas Connection String:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Go to "Database" → "Connect" → "Connect your application"
4. Copy the connection string and replace `<username>`, `<password>`, and `<database>`

### 3. Database Setup and Seeding

```bash
# Run the database seeding script (creates users, topics, and comments)
node scripts/seed-database.js
```

**Expected Output:**
```
Connected to MongoDB
Inserted 2 users
Inserted 2 subjects  
Inserted 2 comments
Created database indexes
Database seeded successfully!
```

### 4. Start the Application

```bash
# Start development server
npm run dev
```

**Application will be available at:**
- URL: [http://localhost:3000](http://localhost:3000)
- The server will automatically reload on file changes

### 5. Test the Application

**Default Test Users:**
- Email: `john@example.com` | Password: `password123`
- Email: `jane@example.com` | Password: `password123`

**Testing Features:**
1. **Registration**: Create new account with optional phone number
2. **Authentication**: Login with test users or new account
3. **Like/Dislike**: Click thumbs up/down on topics and comments
4. **Comments**: Add replies to existing discussions
5. **Topics**: Create new discussion subjects

## 🏗️ Project Structure

```
DiscussionBoard/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts    # Login API with MongoDB
│   │   │   └── register/route.ts # Registration API with phone support
│   │   └── subjects/             # Topics and comments APIs
│   │       ├── route.ts          # Topics CRUD with like data
│   │       └── [id]/             # Dynamic topic routes
│   │           ├── like/route.ts # Topic like/dislike API
│   │           └── comments/     # Comment system
│   │               ├── route.ts  # Comment CRUD with like data
│   │               └── [commentId]/like/route.ts # Comment likes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Home page with topics list
├── components/                   # React Components
│   ├── auth/                     # Authentication UI
│   │   ├── auth-modal.tsx        # Modal wrapper with color themes
│   │   ├── login-form.tsx        # Login form (blue theme)
│   │   └── register-form.tsx     # Registration form with phone (green theme)
│   ├── comments/                 # Comment System
│   │   ├── comment-form.tsx      # New comment form
│   │   ├── comment-item.tsx      # Comment display with likes
│   │   └── comments-section.tsx  # Comment thread container
│   ├── layout/                   # Layout Components
│   │   └── header.tsx            # Navigation with auth buttons
│   ├── subjects/                 # Discussion Topics
│   │   ├── subject-card.tsx      # Topic card with like buttons
│   │   ├── subjects-list.tsx     # Topics grid with user data
│   │   ├── subject-detail.tsx    # Single topic view
│   │   └── create-subject-modal.tsx # New topic creation
│   └── ui/                       # Reusable UI Components
│       ├── like-dislike-buttons.tsx # Interactive vote buttons
│       └── [other-ui-components]     # shadcn/ui components
├── contexts/                     # React Contexts
│   └── auth-context.tsx          # User authentication state
├── lib/                          # Utility Libraries
│   ├── api.ts                    # Frontend API calls
│   ├── auth.ts                   # Auth utilities and validation
│   ├── db.ts                     # TypeScript interfaces
│   ├── mongodb.ts                # Database connection
│   └── utils.ts                  # General utilities
└── scripts/                      # Database Scripts
    ├── seed-database.js          # Node.js seeding script
    └── 02-seed-mongodb.js        # MongoDB shell script
```

## 🔌 API Endpoints

### Authentication APIs
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/register` - User registration with optional phone

### Topics/Subjects APIs  
- `GET /api/subjects?userId=<id>` - Get all topics with user like status
- `POST /api/subjects` - Create new discussion topic
- `POST /api/subjects/[id]/like` - Like/dislike a topic

### Comments APIs
- `GET /api/subjects/[id]/comments?userId=<id>` - Get comments with user like status  
- `POST /api/subjects/[id]/comments` - Create new comment/reply
- `POST /api/subjects/[id]/comments/[commentId]/like` - Like/dislike a comment

### API Request Examples

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Like a Topic:**
```bash
curl -X POST http://localhost:3000/api/subjects/[topicId]/like \
  -H "Content-Type: application/json" \
  -d '{"userId":"[userId]","action":"like"}'
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  phone: String (optional), // NEW: For password recovery
  password_hash: String,
  created_at: Date,
  updated_at: Date
}
```

### Subjects Collection  
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  author_id: String,
  author_username: String,
  like_count: Number,        // NEW: Net likes (likes - dislikes)
  liked_by: [String],        // NEW: Array of user IDs who liked
  disliked_by: [String],     // NEW: Array of user IDs who disliked
  created_at: Date,
  updated_at: Date
}
```

### Comments Collection
```javascript
{
  _id: ObjectId,
  content: String,
  author_id: String,
  author_username: String,
  subject_id: String,
  parent_comment_id: String (nullable),
  like_count: Number,        // NEW: Net likes (likes - dislikes)
  liked_by: [String],        // NEW: Array of user IDs who liked  
  disliked_by: [String],     // NEW: Array of user IDs who disliked
  created_at: Date,
  updated_at: Date
}
```

## 🛠️ Technologies Used

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v3.4
- **Components**: shadcn/ui
- **State Management**: React Context API
- **Date Handling**: date-fns

### Backend Stack  
- **API**: Next.js API Routes
- **Database**: MongoDB Atlas
- **ODM**: Native MongoDB Driver
- **Authentication**: Custom implementation with localStorage
- **Validation**: Custom validators

### Development Tools
- **Package Manager**: npm
- **Bundler**: Next.js (Webpack)
- **CSS Framework**: Tailwind CSS
- **TypeScript**: Full type safety
- **Environment**: Node.js v22+

## 🧪 Testing Features

### 1. User Registration with Phone
```bash
# Test registration through UI or API
POST /api/auth/register
{
  "username": "testuser", 
  "email": "test@example.com",
  "password": "password123",
  "phone": "+1-555-0123"  // Optional field
}
```

### 2. Like/Dislike System
- **Single Vote**: Each user can only like OR dislike
- **Vote Switching**: Change from like to dislike updates counter by -2
- **Visual Feedback**: Buttons show active state when voted
- **Real-time Updates**: Counter updates immediately

### 3. Comment Threading
- **Nested Replies**: Up to 3 levels deep
- **Interactive Voting**: Each comment has like/dislike buttons
- **Author Attribution**: Shows comment author and timestamp

## 🚨 Troubleshooting

### Common Issues

**1. MongoDB Connection Error:**
```bash
# Check your .env.local file
# Ensure MONGODB_URI is correctly formatted
# Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for development)
```

**2. Server Won't Start:**  
```bash
# Check if port 3000 is available
npx kill-port 3000

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**3. Database Not Seeded:**
```bash
# Re-run seeding script
node scripts/seed-database.js

# Check MongoDB Atlas for data
```

**4. Like/Dislike Not Working:**
- Ensure user is logged in
- Check browser console for API errors
- Verify userId is being passed to APIs

### Development Commands

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Check TypeScript errors
npx tsc --noEmit

# Seed database
node scripts/seed-database.js
```

## 🔮 Future Enhancements

- Password reset via phone/email
- Real-time notifications  
- File upload support
- Advanced search and filtering
- User profiles and avatars
- Moderation tools
- Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)  
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: September 19, 2025  
**Version**: 2.0.0 (Added Like/Dislike System & Phone Registration)
**Created with**: GitHub Copilot AI (Claude Sonnet)
