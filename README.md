# The News Ledger

This is a full-stack web application for news, chat, and video calls. Users can read news, search for articles, save bookmarks, and communicate with other online users.

## Features

*   **User Accounts:** Sign up and log in. Uses MongoDB for user data.
*   **News:** View top news by category (General, Technology, Science, Sports, Health, Entertainment, Business) and country (India, USA, UK).
*   **Search:** Find news articles using keywords.
*   **Bookmarks:** Save news articles to read later.
*   **Voice Search:** Search for news using your voice.
*   **Chat:** Real-time private and public chat with other users.
*   **Video Calls:** Make and receive video calls.
*   **Dark Mode:** Switch between light and dark themes.
*   **Responsive:** Works on different screen sizes.
*   **Online Users:** See all users currently online, including multiple connections from the same user.

## Updates and Fixes

This project has received several updates and bug fixes:

*   **Login/Logout:**
    *   Fixed an issue in `frontend/src/login.js` where the username was not correctly saved after login. The username is now taken directly from the login response.
    *   Improved `frontend/src/App.js` to ensure the username is always up-to-date from local storage.
    *   The logout function in `frontend/src/App.js` now correctly removes username, token, and login status from local storage, ensuring proper redirection after logout.
*   **React Router Warnings:** Removed React Router v7 future flag warnings by adding specific flags in `frontend/src/index.js`.
*   **Online User List:** Modified `frontend/src/App.js` to show all connections for online users in the sidebar, not just unique usernames.
*   **News API Error (500):** Updated `backend/server.js` to use an environment variable (`GNEWS_API_KEY`) for the GNews API token, which fixed a server error when fetching news.
*   **Logout Status:** Implemented a `userLoggedOut` event in `frontend/src/App.js` and its handler in `backend/server.js`. This makes sure a user's online status is immediately updated on the server when they log out.
*   **Chat Message Wrap:** Added text wrapping to chat messages in `frontend/src/Chat.js` so long messages display correctly.

## Technologies

**Frontend:**
*   React.js
*   React Router DOM
*   Tailwind CSS
*   Socket.IO Client
*   Axios
*   React Toastify
*   React Loading Skeleton
*   React Speech Recognition
*   Framer Motion

**Backend:**
*   Node.js
*   Express.js
*   Socket.IO
*   MongoDB (Mongoose)
*   bcryptjs
*   jsonwebtoken
*   dotenv
*   Axios

## Setup

To run this project locally:

### 1. Get the Code

```bash
git clone https://github.com/SandeepGKP/The-News-Ledger.git
cd The-News-Ledger
```

### 2. Backend Setup

Go to the `backend` folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` folder and add these lines:

```
mongoURI = YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET = YOUR_JWT_SECRET_KEY
GNEWS_API_KEY = YOUR_GNEWS_API_KEY
```

*   Replace `YOUR_MONGODB_CONNECTION_STRING` with your MongoDB Atlas connection string.
*   Replace `YOUR_JWT_SECRET_KEY` with a secret key for security.
*   Replace `YOUR_GNEWS_API_KEY` with your API key from [GNews](https://gnews.io/).

Start the backend server:

```bash
node server.js
```

The backend will run on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal and go to the `frontend` folder:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend server:

```bash
npm start
```

The frontend will open in your browser at `http://localhost:3000`.

## Deployment

This application can be deployed on platforms like Render. Make sure your environment variables (`mongoURI`, `JWT_SECRET`, `GNEWS_API_KEY`) are set up in your deployment environment.

## How to Use

1.  **Login:** Open the web link, you will go to the login page. Log in or sign up for a new account.
2.  **News:** After logging in, you will see the news feed. You can filter news or search for topics.
3.  **Chat:** Go to the chat section. The sidebar shows who is online. Click a user to chat.
4.  **Video Call:** Start a video call with an online user from the sidebar.
5.  **Bookmarks:** Save news articles and view them in the "Bookmarks" menu.
6.  **Dark Mode:** Click the sun/moon icon to change the theme.
7.  **Logout:** Click the "Logout" button to end your session.
