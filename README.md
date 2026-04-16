<div align="center">
  <img src="client/src/assets/logo.png" alt="UniBorrow Logo" width="100"/>
  <h1>🎓 UniBorrow</h1>
  <p><em>A vibrant, community-first platform for university students to share, borrow, and connect.</em></p>
</div>

---

## 📖 About UniBorrow
UniBorrow is designed to encourage a circular economy on campus. It reduces waste and fosters student connection by providing a safe, easy-to-use platform to lend items you don't need every day and borrow the things you do. Built with cutting-edge tech, UniBorrow provides a seamless, real-time experience that looks as good as it feels.

## 🚀 Key Features

*   **🌙 Modern, Soothing UI:** A brilliantly responsive interface crafted with Tailwind CSS v4, featuring a carefully refined, accessible dark mode for comfortable late-night browsing.
*   **💬 Live Chat & Notifications:** Real-time integrated messaging powered by WebSockets, allowing students to seamlessly coordinate item handoffs without leaving the app.
*   **📅 Availability Calendar:** Built-in scheduling to track when items are available or booked, ensuring conflict-free borrowing periods.
*   **⭐ Ratings & Reviews:** A community-driven reputation system where users can rate interactions, fostering trust and accountability.
*   **📦 Seamless Item Management:** List new items in seconds, upload images effortlessly, and track your active borrowings/listings via an intuitive personalized dashboard.
*   **🔍 Advanced Search:** Fast and efficient item browsing and filtering.
*   **☁️ Cloud File Storage:** Fast, secure, and reliable image uploads handled exclusively by Cloudinary.
*   **🔒 Secure & Private:** Industry-standard JWT-based user authentication and authorization keeps student accounts safe.
*   **🤝 Community First:** A beautifully designed landing page focused deeply on student community engagement and zero-waste living.

## 💻 Tech Stack

UniBorrow leverages a robust full-stack **MERN** architecture, turbo-charged with the latest tooling.

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) for lightning-fast development, HMR, and optimized production builds.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling alongside [Next-Themes](https://github.com/pacocoursey/next-themes) for flawless Dark/Light mode toggling.
- **UI Architecture:** [Radix UI](https://www.radix-ui.com/) primitives to guarantee accessible, headless components.
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) for highly scalable global state.
- **Routing & Networking:** [React Router DOM v7](https://reactrouter.com/) and [Axios](https://axios-http.com/).
- **Real-Time Client:** [Socket.io-client](https://socket.io/) for instant connection with the backend.

### Backend
- **Core Server:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) for a highly scalable RESTful API.
- **Database Layer:** [MongoDB](https://www.mongodb.com/) utilizing [Mongoose](https://mongoosejs.com/) as the elegant Object Data Modeling (ODM) layer.
- **Real-Time Hub:** [Socket.io](https://socket.io/) handling bidirectional event streams.
- **Security:** [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs) for solid password hashing and session management.
- **Media Management:** [Cloudinary](https://cloudinary.com/) wrapped with [Multer](https://github.com/expressjs/multer) for parsing and pushing user images.
- **Automation:** [node-cron](https://www.npmjs.com/package/node-cron) for automated background tasks.

## 🛠️ Getting Started

### Prerequisites
Make sure you have installed:
*   Node.js (v18 or higher recommended)
*   A running MongoDB instance (Local or Atlas)
*   A Cloudinary Account (for image hosting)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/paridhijain07/UniBorrow.git
   cd UniBorrow
   ```

2. **Install all dependencies:**
   *Install backend dependencies:*
   ```bash
   cd backend
   npm install
   ```
   *Install frontend dependencies:*
   ```bash
   cd ../client
   npm install
   ```

3. **Environment Setup:**
   *   In the **`backend`** directory, create a `.env` file containing:
       ```env
       PORT=5000
       MONGO_URI=your_mongodb_connection_string
       JWT_SECRET=your_jwt_secret_key
       CLOUDINARY_CLOUD_NAME=your_cloud_name
       CLOUDINARY_API_KEY=your_api_key
       CLOUDINARY_API_SECRET=your_api_secret
       ```
   *   In the **`client`** directory, create a `.env` file containing:
       ```env
       VITE_API_URL=http://localhost:5000/api
       ```

4. **Run the specific Development Servers:**
   *(You'll need two separate terminal instances for this)*
   
   **Launch the Node Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Launch the React Frontend:**
   ```bash
   cd client
   npm run dev
   ```


---

