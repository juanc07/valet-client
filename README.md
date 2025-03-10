# Valet Web App

The Valet Web App is a full-stack application with a Node.js/MongoDB backend (server) and a Vite-powered React frontend (client). This guide will help you set up and run both parts on your machine.

## Important Note

The server and client have distinct setups. **Always start the server first** when testing, as the client depends on its APIs. The client uses `pnpm` and Vite, while the server uses `npm`.

## Repositories

- **Server**: [https://github.com/juanc07/valet-server](https://github.com/juanc07/valet-server)  
- **Client**: [https://github.com/juanc07/valet-client](https://github.com/juanc07/valet-client)

---

## Prerequisites

Before you begin, install these tools:

1. **Node.js**  
   - Install the latest LTS version (v20.x as of March 2025) from [nodejs.org](https://nodejs.org/).  
   - Confirm:  
     ```bash
     node -v
     ```

2. **pnpm (for Client) and npm (for Server)**  
   - Install `pnpm` globally for the client:  
     ```bash
     npm install -g pnpm
     ```
   - Update `npm` globally for the server:  
     ```bash
     npm install -g npm
     ```
   - Verify:  
     ```bash
     pnpm -v
     npm -v
     ```

3. **MongoDB Community Edition**  
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community).  
   - Install based on your OS:  
     - **Windows**: Use the MSI installer.  
     - **MacOS**: `brew install mongodb-community` (requires Homebrew).  
     - **Linux**: Example for Ubuntu: `sudo apt-get install mongodb`.  
   - Start MongoDB:  
     ```bash
     mongod
     ```
     (Run in a separate terminal or configure as a service.)

4. **MongoDB Compass (Optional)**  
   - Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass).  
   - Use this GUI to manage your MongoDB database.  
   - Connect to `mongodb://localhost:27017` (default) or your custom URI.

---

## Setup Instructions

### Server Setup

1. **Clone the Repository**  
   - Ensure Git is installed (`git --version`).  
   - Clone:  
     ```bash
     git clone https://github.com/juanc07/valet-server.git
     cd valet-server
     ```

2. **Install Dependencies**  
   - Use `npm`:  
     ```bash
     npm install
     ```

3. **Configure Environment**  
   - Create `.env` from `.env.copy` (if provided):  
     ```bash
     MONGODB_URI=mongodb://localhost:27017/valetdb
     PORT=3000
     ```
   - Adjust values as needed or ask [juanc07](https://github.com/juanc07).

### Client Setup

1. **Clone the Repository**  
   - In a new terminal:  
     ```bash
     git clone https://github.com/juanc07/valet-client.git
     cd valet-client
     ```

2. **Install Dependencies**  
   - Use `pnpm`:  
     ```bash
     pnpm install
     pnpm add -D vite-plugin-node-polyfills  # For Buffer polyfill
     ```

3. **Configure Environment**  
   - Create `.env` from `.env.copy` (if provided):  
     ```bash
     VITE_API_URL=http://localhost:3000/api
     ```
   - Ensure `VITE_API_URL` matches the server’s port.

---

## Running the App

### 1. Start the Server

- In `valet-server`:  
  ```bash
  npm run start

  Runs on port 3000 by default (check .env or package.json).

### 2. Start the Client

- In valet-client (after server is running):  
  Development Mode:  
  bash

  pnpm dev

  Opens at http://localhost:5173 (Vite’s default dev port).

  Production Mode:  
  bash

  pnpm start
  Builds and previews at http://localhost:5174.

### 3. Test It

- Server: Test APIs with Postman/curl (e.g., http://localhost:3000/api).  

  Client: Open http://localhost:5173 (dev) or http://localhost:5174 (production).  

  Ensure MongoDB and the server are running, or the client will fail to connect.

### Configuration

- Server .env:  
  bash

  MONGODB_URI=mongodb://localhost:27017/valetdb
  PORT=3000

  Client .env:  
  bash

  VITE_API_URL=http://localhost:3000/api

  Contact juanc07 for specific values if unsure.

### Troubleshooting

- MongoDB Connection Failed?  
  Verify mongod is running: ps aux | grep mongod (Unix) or Task Manager (Windows).  

  Check MONGODB_URI in .env.

  Port Conflicts?  
  Adjust PORT in .env or kill processes:  
  bash

  netstat -aon | findstr :3000  # Windows
  taskkill /PID <pid> /F

  bash

  lsof -i :5173  # Unix
  kill -9 <pid>

  Blank Page in Production (pnpm start)?  
  Open browser console (F12) for errors (e.g., Failed to resolve module specifier "buffer").  

  Ensure vite-plugin-node-polyfills is installed and configured in vite.config.ts.  

  Run pnpm clean && pnpm build to clear stale artifacts.

  CSS Not Applying?  
  Verify postcss.config.cjs uses @tailwindcss/postcss.  

  Check src/index.css has @import "tailwindcss".

  Build Fails?  
  Share terminal output with juanc07.  

  Ensure all dependencies are installed (pnpm install).


  Tips
  Keep MongoDB (mongod) running in the background.  

  Use separate terminals for server and client.  

  pnpm dev for client development (hot reloading); pnpm start for production preview.  

  MongoDB Compass helps debug database issues visually.  

  If using Windows, run commands in Git Bash or WSL for Bash compatibility.

