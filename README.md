#  RoommateFinder

A full-stack web application that helps people find compatible roommates using smart matching algorithms. Built with React, Node.js, Express, and MongoDB.

##  Features

-  **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
-  **Smart Matching** - Intelligent compatibility scoring based on:
  - Budget preferences
  - Location proximity
  - Lifestyle compatibility (smoking, pets, cleanliness, social habits)
  - Gender preferences
-  **Listing Management** - Create, edit, and delete property listings
-  **Image Uploads** - Upload property images via Cloudinary integration
-  **Real-time Messaging** - In-app messaging system to connect with potential roommates
-  **Advanced Filtering** - Search listings by city, rent range, property type, amenities, and more
-  **Responsive Design** - Works seamlessly on desktop and mobile devices
-  **India-focused** - Pre-loaded with Indian states and major cities

##  Tech Stack

### Frontend
- **React 19** - UI library
- **Lucide React** - Icon library
- **Custom CSS** - Styling with utility classes

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcrypt.js** - Password hashing
- **Cloudinary** - Image storage and management
- **Multer** - File upload handling

##  Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js

##  Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd roommate-finder
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

### 3. Configure Environment Variables

Edit `backend/.env` and add the following:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/roommate-finder
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary Configuration (Get from https://cloudinary.com/)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Getting Cloudinary Credentials:
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Paste them in the `.env` file

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### 5. Start the Backend Server

```bash
# From backend directory
npm run dev
```

The backend server will start on `http://localhost:5001`

### 6. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 📱 Usage

### For Users Looking for Roommates:

1. **Sign Up** - Create an account with your preferences
2. **Set Preferences** - Define your budget, location, and lifestyle preferences
3. **Browse Listings** - View available properties with compatibility scores
4. **View Matches** - See listings sorted by compatibility
5. **Contact Owners** - Message property owners directly
6. **Filter Search** - Use advanced filters to narrow down options

### For Property Owners:

1. **Create Listing** - Add property details, images, and roommate preferences
2. **Manage Listings** - Edit or delete your listings from the dashboard
3. **Receive Messages** - Communicate with interested roommates
4. **Set Preferences** - Specify the type of roommate you're looking for

##  Project Structure

```
roommate-finder/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── listingController.js   # Listing CRUD operations
│   │   ├── matchingController.js  # Matching algorithm
│   │   └── messageController.js   # Messaging functionality
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Listing.js             # Listing schema
│   │   └── Message.js             # Message schema
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── listingRoutes.js       # Listing endpoints
│   │   └── messageRoutes.js       # Message endpoints
│   ├── middleware/
│   │   └── auth.js                # JWT authentication middleware
│   ├── .env                       # Environment variables
│   ├── server.js                  # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main React application
│   │   ├── App.css                # Global styles
│   │   └── index.js               # React entry point
│   ├── public/
│   └── package.json
└── README.md
```

##  API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/update-profile` - Update user profile (Protected)
- `GET /api/auth/user/:id` - Get user profile by ID

### Listings
- `GET /api/listings` - Get all active listings
- `GET /api/listings/:id` - Get single listing
- `GET /api/listings/search` - Search listings with filters
- `POST /api/listings` - Create new listing (Protected)
- `PUT /api/listings/:id` - Update listing (Protected)
- `DELETE /api/listings/:id` - Delete listing (Protected)
- `GET /api/listings/user/me` - Get user's listings (Protected)
- `GET /api/listings/matches/me` - Get matched listings (Protected)
- `POST /api/listings/:id/upload-images` - Upload images (Protected)

### Messages
- `POST /api/messages` - Send message (Protected)
- `GET /api/messages/conversations` - Get all conversations (Protected)
- `GET /api/messages/:userId` - Get messages with specific user (Protected)
- `GET /api/messages/unread-count` - Get unread message count (Protected)

##  Matching Algorithm

The compatibility score is calculated based on:

- **Budget (30%)** - How well the rent fits within user's budget range
- **Location (20%)** - City and state matching
- **Gender Preference (15%)** - Matching gender preferences
- **Smoking Preference (15%)** - Smoking habits compatibility
- **Pets (10%)** - Pet ownership compatibility
- **Lifestyle (10%)** - Social habits matching (quiet, moderate, social, party)

Scores are displayed as percentages with color-coded badges:
-  80-100%: Excellent Match
-  60-79%: Good Match
-  40-59%: Fair Match
-  0-39%: Low Match

##  Features Walkthrough

### Smart Matching System
Users receive compatibility scores for each listing based on their preferences, making it easy to find the most suitable roommates.

### Real-time Messaging
Built-in messaging system allows users to communicate without sharing personal contact information initially.

### Image Upload
Property owners can upload up to 5 images per listing using Cloudinary's robust image management.

### Advanced Filtering
Search by multiple criteria including city, rent range, property type, number of bedrooms/bathrooms, pet policies, and more.

##  Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication with expiry
- Protected routes with authentication middleware
- Input validation on both frontend and backend
- Secure HTTP-only token storage

##  Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh
# or
mongo

# If not running, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

### Port Already in Use
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Cloudinary Upload Fails
- Verify your Cloudinary credentials in `.env`
- Check that you're not exceeding the free tier limits
- Ensure images are under 10MB

### CORS Issues
Make sure the frontend proxy is set correctly in `frontend/package.json`:
```json
"proxy": "http://localhost:5001"
```

##  Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/roommate-finder` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dj4abc123` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcDEF123xyz456` |

##  Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas is configured for production
3. Update CORS settings for production frontend URL

### Frontend Deployment (Vercel/Netlify)
1. Update `API_URL` in `App.js` to your production backend URL
2. Build the project: `npm run build`
3. Deploy the `build` folder

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is open source and available under the [MIT License](LICENSE).

##  Author

Syed Ayaan Hasan

##  Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Image hosting by [Cloudinary](https://cloudinary.com/)
- Inspiration from modern roommate-finding platforms

## 📞 Support

For support, email ayaangp06@gmail.com or open an issue in the repository.

---
