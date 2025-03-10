# Valet Web App

The Valet Web App is a full-stack application built with Node.js and MongoDB, split into a server and client. This guide will help you set up and run both parts on your machine.

## Important Note
The setup process is identical for both the client and server, but **always start the server first** when testing, as the client depends on it.

## Repositories
- **Server**: [https://github.com/juanc07/valet-server](https://github.com/juanc07/valet-server)  
- **Client**: [https://github.com/juanc07/valet-client](https://github.com/juanc07/valet-client)

---

## Prerequisites

Before you begin, install the following tools:

1. **Node.js**  
   - Install the latest LTS version from [nodejs.org](https://nodejs.org/).  
   - Confirm it’s working:  
     ```bash
     node -v
     ```

2. **npm (Node Package Manager)**  
   - Included with Node.js, but update it globally for the latest version:  
     ```bash
     npm install -g npm
     ```
   - Verify:  
     ```bash
     npm -v
     ```

3. **MongoDB Community Edition**  
   - Get it from [mongodb.com](https://www.mongodb.com/try/download/community).  
   - Install based on your OS:  
     - **Windows**: Use the MSI installer.  
     - **MacOS**: Run `brew install mongodb-community` (requires Homebrew).  
     - **Linux**: Example for Ubuntu: `sudo apt-get install mongodb`.  
   - Start MongoDB:  
     ```bash
     mongod
     ```
     (Run in a separate terminal or configure it as a background service.)

4. **MongoDB Compass (Optional)**  
   - Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass).  
   - Use this GUI to inspect or manage your MongoDB database.  
   - Connect to `mongodb://localhost:27017` (default) or your custom URI.

---

## Setup Instructions

For **both the server and client**, follow these steps in separate directories:

1. **Clone the Repository**  
   - Ensure Git is installed (`git --version`).  
   - Clone the server:  
     ```bash
     git clone https://github.com/juanc07/valet-server.git
     cd valet-server
     ```
   - Clone the client:  
     ```bash
     git clone https://github.com/juanc07/valet-client.git
     cd valet-client
     ```

2. **Install Dependencies**  
   - In each folder (server and client), install the npm packages:  
     ```bash
     npm install
     ```

3. **Build the Project**  
   - If a build step is required (e.g., for the client), run:  
     ```bash
     npm run build
     ```
     (Skip this for the server if it’s not needed—check `package.json`.)

---

## Running the App

1. **Start the Server**  
   - In the `valet-server` folder:  
     ```bash
     npm run start
     ```
   - Default port is typically `3000`—check your server config.

2. **Start the Client**  
   - In the `valet-client` folder (after the server is running):  
     ```bash
     npm run start
     ```
   - Default port is often `3000` or `8080`—check your client config.

3. **Test It**  
   - Open a browser to `http://localhost:<client-port>` (e.g., `http://localhost:3000`).  
   - Use Postman or curl to test server APIs if needed (e.g., `http://localhost:3000/api`).  
   - Ensure MongoDB is running, or the server won’t connect.

---

## Configuration
- **Environment Variables**: Check each repo for a `.env.copy` file. Create a `.env` file in both `valet-server` and `valet-client` with required settings (e.g., MongoDB URI, ports). Example for server:  

MONGODB_URI=mongodb://localhost:27017/valetdb
PORT=3000

- Ask the project owner (juanc07) for specific values if unsure.

---

## Troubleshooting
- **MongoDB Connection Failed?** Verify `mongod` is running and the URI matches your setup.  
- **Port Conflicts?** Adjust `PORT` in `.env` or kill conflicting processes.  
- **npm Issues?** Ensure Node.js/npm versions align with the app (check `package.json`).

---

## Tips
- Keep MongoDB (`mongod`) running in the background during development.  
- Use separate terminals for the server and client.  
- MongoDB Compass is great for debugging database issues visually.

Happy coding! Reach out to [juanc07](https://github.com/juanc07) for support.