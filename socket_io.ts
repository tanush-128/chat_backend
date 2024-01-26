import { PrismaClient } from "@prisma/client";
import express from "express";
import { Server } from "socket.io";
import { sendNotification, setVapidDetails } from "web-push";
var app = express();
var server = app.listen(3001);
let vapidKeys = {
  publicKey:
    "BAeRtWPMnIVjZBidFdKLRP4P7FB6ekbe3bThEofCHASAYtloHpfeWI0Zd0SBePtkzy5UT8czPQUHviFbEm20llY",
  privateKey: "hL-Pd5Gl2FwTJ7Fy9vbJtPRMnOsXSMvZfhfQfHrNKgE",
};
setVapidDetails(
  "mailto:test@code.uk.co",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "*",
  },
});

const db = new PrismaClient();

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnecting", () => {
    console.log("disconnecting");

    socket.data.chatRoomsIds?.forEach((room: string) => {
      socket.leave(room);
      io.to(room).emit("userOffline", {
        chatRoomId: room,
        userEmail: socket.data.userEmail,
        userName: socket.data.userName,
      });
    });
  });
  socket.on("sendUserInfo", (user) => {
    socket.data.userEmail = user.userEmail;
    socket.data.userName = user.userName;
  });

  socket.on("join_chatrooms", (chatRoomsIds) => {
    socket.data.chatRoomsIds = chatRoomsIds;

    for (const chatRoomId of chatRoomsIds) {
      socket.join(chatRoomId);
    }
  });
  socket.on("user_online", (msg) => {
    io.fetchSockets().then((sockets) => {
      sockets.forEach((s) => {
        s.rooms.forEach((room) => {
          if (room !== s.id) {
            io.to(room).emit("userOnline", {
              chatRoomId: room,
              userEmail: s.data.userEmail,
              userName: s.data.userName,
            });
          }
        });
      });
    });
  });

  socket.on("typing", (typing) => {
    io.to(typing.chatRoomId).emit("typing", typing);
  });
  socket.on("message", async (message) => {
    io.to(message.chatRoomId).emit("message", {
      ...message,
      createdAt: new Date(),
    });

    const users = await db.user.findMany({
      where: {
        chatRooms: {
          some: {
            chatRoomId: message.chatRoomId,
          },
        },
      },
    });

    const subs = users
      .filter((user) => user.email !== message.userEmail)
      .map((user) => user.subscriptions.map((sub) => JSON.parse(sub)));

    subs.forEach((sub) => {
      sub.forEach((s) => {
        sendNotification(s, JSON.stringify(message)).catch((e) => {});
      });
    });
    if (message.save === false) return;
    const prismaMessage = await db.message.create({
      data: {
        content: message.content,
        // chatRoomId: message.chatRoomId,
        chatRoom: {
          connect: {
            id: message.chatRoomId,
          },
        },
        userName: message.userName,
        user: {
          connect: {
            email: message.userEmail,
          },
        },
      },
    });
  });

  socket.on("deleteMessage", async (message) => {
    io.to(message.chatRoomId).emit("deleteMessage", message);
    const prismaMessage = await db.message.delete({
      where: {
        id: message.id,
      },
    });
  });
});
