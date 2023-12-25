import { WebSocketServer } from "ws";
import {
  ChatRoom,
  ChatRoomOnUser,
  Message,
  PrismaClient,
  User,
} from "@prisma/client";

interface ChatRoomOnUserWithUser extends ChatRoomOnUser {
  user: User;
}

export interface ChatRoomType extends ChatRoom {
  messages: Message[];
  users: ChatRoomOnUserWithUser[];
}

// const ws =require("ws")

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
      this.ws.send(
        JSON.stringify({
          type: "chatrooms",
          data: chatrooms,
        })
      );
      this.NotifyOnlineUsers();
    });

    this.ws.onmessage = (message) => {
      const _message = JSON.parse(message.data);
      if (_message.type === "message") {
        this.onMessage(_message);
      }
      if (_message.type === "typing") {
        this.onTyping(_message);
      }
      if (_message.type === "webrtc") {
        if (_message.offer.type === "call") {
          console.log(_message);
          users.forEach((user) => {
            if (
              _message.data.userEmails.includes(user.userEmail) &&
              user.userEmail !== this.userEmail
            ) {
              const callOffer = {
                ..._message,
                data: {
                  userEmails: _message.data.userEmails.filter(
                    (email: string) => email !== user.userEmail
                  ),
                  selfEmail: this.userEmail,
                },
              };
              console.log("sending webrtc call :", callOffer);
              user.sendMessage(callOffer);
            }
          });
        } else {
          users.forEach((user) => {
            if (_message.data.to === user.userEmail) {
              user.sendMessage(_message);
            }
          });
        }
      }
    };

    this.ws.onclose = () => {
      // when user closes the connection notify the other users which have a chatroom common with this user
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
    //check if user is online then notify other users which have a chatroom common with this user and also notify this user about other online users
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
// upgrade socketserver to  ws:// to wss://

const wss = new WebSocketServer({ port: 3001 });

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
      messages: true,
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

wss.on("connection", function (ws: WebSocket, incomingMessage) {
  const searchParams = new URL(
    incomingMessage.url as string,
    "ws://localhost:3001"
  );
  const userEmail: string = searchParams.searchParams.get(
    "userEmail"
  ) as string;
  const user = new UserConnection(userEmail, ws);
  users.push(user);
});
