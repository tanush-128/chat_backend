import { WebSocket, WebSocketServer } from "ws";
import {
  ChatRoom,
  ChatRoomOnUser,
  Message,
  PrismaClient,
  User,
} from "@prisma/client";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
// import {} from "http2"
import express from "express";
import { IncomingMessage } from "http";
import { createServer } from "http";
import { Server } from "socket.io";
interface ChatRoomOnUserWithUser extends ChatRoomOnUser {
  user: User;
}

export interface ChatRoomType extends ChatRoom {
  users: ChatRoomOnUserWithUser[];
}

const users: UserConnection[] = [];

class UserConnection {
  chatrooms: ChatRoomType[] = [];
  userEmail: string;
  ws: WebSocket;

  constructor(userEmail: string, ws: WebSocket) {
    this.userEmail = userEmail;
    this.ws = ws;
    getChatRoomMessages(userEmail).then((chatrooms) => {
      this.chatrooms = chatrooms;

      this.NotifyOnlineUsers();
    });

    this.ws.onmessage = (message) => {
      const _message = JSON.parse(message.data.toString());
      if (_message.type === "message") {
        this.onMessage(_message);
      }
      if (_message.type === "typing") {
        this.onTyping(_message);
      }
    };

    this.ws.onclose = () => {
      users.forEach((user) => {
        if (user.userEmail !== this.userEmail) {
          user.chatrooms.forEach((chatroom) => {
            this.chatrooms.forEach((_chatroom) => {
              if (chatroom.id === _chatroom.id) {
                user.sendMessage({
                  type: "offline",
                  data: {
                    chatRoomId: chatroom.id,
                    userEmail: this.userEmail,
                  },
                });
              }
            });
          });
        }
      });
      users.splice(users.indexOf(this), 1);
    };
  }

  NotifyOnlineUsers = () => {
    console.log("open");

    users.forEach((user) => {
      if (user.userEmail !== this.userEmail) {
        user.chatrooms.forEach((chatroom) => {
          this.chatrooms.forEach((_chatroom) => {
            if (chatroom.id === _chatroom.id) {
              user.sendMessage({
                type: "online",
                data: {
                  chatRoomId: chatroom.id,
                  userEmail: this.userEmail,
                },
              });
              this.sendMessage({
                type: "online",
                data: {
                  chatRoomId: chatroom.id,
                  userEmail: user.userEmail,
                },
              });
            }
          });
        });
      }
    });
  };

  onTyping(message: {
    data: { chatRoomId: string; userEmail: string };
    type: "typing";
  }) {
    users.forEach((user) => {
      user.chatrooms.forEach((chatroom) => {
        if (chatroom.id === message.data.chatRoomId) {
          user.sendMessage(message);
        }
      });
    });
  }

  onMessage(message: {
    data: {
      chatRoomId: string;
      message: string;
      userName: string;
      userEmail: string;
    };
    type: "message";
  }) {
    users.forEach((user) => {
      user.chatrooms.forEach((chatroom) => {
        if (chatroom.id === message.data.chatRoomId) {
          user.sendMessage(message);
        }
      });
    });

    setChatRoomUsers(
      message.data.chatRoomId,
      this.userEmail,
      message.data.message,
      message.data.userName
    );
  }

  sendMessage(message: { data: any; type: string }) {
    this.ws.send(JSON.stringify(message));
  }
}


// const httpServer = createServer();
// const io = new Server(httpServer, {
//   // options
// });

// io.on("connection", (socket) => {
//   // ..

// });

// httpServer.listen(3001);

const wss = new WebSocketServer({ noServer: true });
const app: express.Application = express();

app.get("/", (req, res) => {
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
});

app.listen(3001, () => {
  console.log("Example app listening on port 3001!");
});
const server = app.listen(3001);

const prisma = new PrismaClient();

async function getChatRoomMessages(userEmail: string) {
  const chatrooms = await prisma.chatRoom.findMany({
    where: {
      users: {
        some: {
          user: {
            email: userEmail,
          },
        },
      },
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });

  return chatrooms;
}

async function setChatRoomUsers(
  _chatRoomId: string,
  userEmail: string,
  content: string,
  userName: string
) {
  const messages = await prisma?.message.create({
    data: {
      chatRoomId: _chatRoomId,
      userEmail: userEmail,
      content: content,
      userName: userName,
    },
  });
}

const onConnect = (client: WebSocket, request: IncomingMessage) => {
  const searchParams = new URL(request.url as string, "http://localhost:3001");
  const userEmail: string = searchParams.searchParams.get(
    "userEmail"
  ) as string;
  const user = new UserConnection(userEmail, client);
  users.push(user);
};
