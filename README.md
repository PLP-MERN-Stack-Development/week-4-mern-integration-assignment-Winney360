MERN Blog Application
Project Overview
This project is a MERN stack application designed to create a simple blog platform where users can create, view, and manage posts with image uploads. The application leverages MongoDB for data storage, Express.js for the backend API, React for the frontend interface, and Node.js as the runtime environment. The focus is on implementing CRUD (Create, Read, Update, Delete) operations for posts, with an emphasis on handling image uploads securely and efficiently.

Prerequisites

Node.js (v14.x or later)
npm or pnpm (package manager)
MongoDB (local instance or MongoDB Atlas)
Git (for cloning the repository)

Installation

Clone the Repository
git clone https://github.com/your-username/mern-blog-app.git
cd mern-blog-app


Install Dependencies

For the server:cd server
pnpm install


For the client:cd client
pnpm install




Configure Environment Variables

Create a .env file in the server directory with the following:PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-blog
JWT_SECRET=your-secret-key


Adjust MONGO_URI if using MongoDB Atlas or a different local port.


Start the Application

Start the server:cd server
pnpm run dev


Start the client:cd client
pnpm run dev


The server will run on http://localhost:5000, and the client on http://localhost:5173 (default Vite port).


Initialize Database

Ensure MongoDB is running. The application will create the necessary collections (posts, users, categories) on the first request.



Directory Structure
mern-blog-app/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── PostForm.jsx
│   │   │   └── PostList.jsx
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   └── .env
├── server/           # Node.js/Express backend
│   ├── models/
│   │   ├── Post.js
│   │   ├── User.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── categories.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── README.md

API Documentation
Base URL
http://localhost:5000/api
Authentication

Middleware: All routes require a JWT token in the Authorization header as Bearer <token>.
Token Generation: Obtained via the /api/auth/login endpoint (not detailed here, assume implemented).

Endpoints
Posts

Create Post

URL: POST /posts
Headers: Authorization: Bearer <token>
Body (multipart/form-data):
title (string, required)
content (string, required)
categoryId (string, required)
featuredImage (file, optional, image/*)


Response:
201: { success: true, data: post }
400: { success: false, error: 'Missing required fields' | 'Validation error' }
500: { success: false, error: 'Server error' }


Description: Creates a new post with an optional image upload.


Get All Posts

URL: GET /posts
Headers: Authorization: Bearer <token>
Response:
200: [{ _id, title, content, category, featuredImage, author, slug, createdAt }, ...]
500: { error: 'Server error' }


Description: Retrieves all posts with populated category and author fields.


Get Post by ID

URL: GET /posts/:id
Headers: Authorization: Bearer <token>
Response:
200: { _id, title, content, category, featuredImage, author, slug, createdAt }
404: { error: 'Post not found' }
500: { error: 'Server error' }


Description: Retrieves a single post by ID.


Update Post

URL: PUT /posts/:id
Headers: Authorization: Bearer <token>
Body (multipart/form-data):
title (string, optional)
content (string, optional)
categoryId (string, optional)
featuredImage (file, optional, image/*)


Response:
200: { success: true, data: post }
403: { error: 'Not authorized' }
404: { error: 'Post not found' }
500: { error: 'Server error' }


Description: Updates a post if the authenticated user is the author.


Delete Post

URL: DELETE /posts/:id
Headers: Authorization: Bearer <token>
Response:
200: { message: 'Post deleted' }
403: { error: 'Not authorized' }
404: { error: 'Post not found' }
500: { error: 'Server error' }


Description: Deletes a post if the authenticated user is the author.



Categories

Get All Categories (assumed implemented)
URL: GET /categories
Headers: Authorization: Bearer <token>
Response:
200: [{ _id, name }, ...]
500: { error: 'Server error' }


Description: Retrieves all categories for post assignment.



Features Implemented

User Authentication

Secure API endpoints with JWT-based authentication.
Users are identified by a unique id stored in the token payload.


Post Creation

Create posts with title, content, categoryId, and an optional featuredImage.
Validates required fields and handles image uploads up to 2MB.


Image Upload

Uses multer to store images in the uploads/ directory.
Supports image files (e.g., .jpg, .png) with filename uniqueness.


Basic CRUD Operations

Create: Posts can be created via POST /posts.
Read: Posts can be retrieved via GET /posts and GET /posts/:id.
Update: Posts can be updated via PUT /posts/:id (unverified).
Delete: Posts can be deleted via DELETE /posts/:id (unverified).


Author Authorization

Restricts PUT and DELETE operations to the post’s author based on req.user.id.


Error Handling

Provides meaningful error responses for validation, upload failures, and server errors.


Contributing

Fork the repository.
Create a feature branch (git checkout -b feature-name).
Commit changes (git commit -m "Description").
Push to the branch (git push origin feature-name).
Open a pull request.

License
This project is licensed under the MIT License - see the LICENSE file for details.