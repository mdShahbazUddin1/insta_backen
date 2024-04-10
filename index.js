const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const activeUsers = new Map();

io.on("connection", (socket) => {
  // Assign unique user IDs to the newly connected users
  const userId = generateUserId();
  activeUsers.set(userId, socket.id);
  console.log(`User ${userId} connected`);

  // Automatically pair users when two users are available
  if (activeUsers.size >= 2) {
    const usersToPair = Array.from(activeUsers.keys()).splice(0, 2); // Get the first two user IDs
    const [user1, user2] = usersToPair;
    // Notify both users about the pairing
    io.to(activeUsers.get(user1)).emit("paired", user2);
    io.to(activeUsers.get(user2)).emit("paired", user1);
    console.log(`Users ${user1} and ${user2} paired for a call`);
    // Remove paired users from activeUsers map
    activeUsers.delete(user1);
    activeUsers.delete(user2);
  }

  // Handle user disconnection
  socket.on("disconnect", () => {
    for (const [user, id] of activeUsers) {
      if (id === socket.id) {
        activeUsers.delete(user);
        console.log(`User ${user} disconnected`);
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Function to generate unique user IDs
function generateUserId() {
  return Math.random().toString(36).substring(7);
}
