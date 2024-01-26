"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var express_1 = require("express");
var socket_io_1 = require("socket.io");
var web_push_1 = require("web-push");
var app = (0, express_1.default)();
var server = app.listen(3001);
var vapidKeys = {
    publicKey: "BAeRtWPMnIVjZBidFdKLRP4P7FB6ekbe3bThEofCHASAYtloHpfeWI0Zd0SBePtkzy5UT8czPQUHviFbEm20llY",
    privateKey: "hL-Pd5Gl2FwTJ7Fy9vbJtPRMnOsXSMvZfhfQfHrNKgE",
};
(0, web_push_1.setVapidDetails)("mailto:test@code.uk.co", vapidKeys.publicKey, vapidKeys.privateKey);
var io = new socket_io_1.Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: "*",
    },
});
var db = new client_1.PrismaClient();
io.on("connection", function (socket) {
    console.log("a user connected");
    socket.on("join_chatrooms", function (chatRoomsIds) {
        console.log(chatRoomsIds);
        for (var _i = 0, chatRoomsIds_1 = chatRoomsIds; _i < chatRoomsIds_1.length; _i++) {
            var chatRoomId = chatRoomsIds_1[_i];
            socket.join(chatRoomId);
        }
    });
    socket.on("typing", function (typing) {
        io.to(typing.chatRoomId).emit("typing", typing);
        console.log(typing);
    });
    socket.on("message", function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var users, subs, prismaMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(message);
                    io.to(message.chatRoomId).emit("message", __assign(__assign({}, message), { createdAt: new Date() }));
                    console.log(message);
                    return [4 /*yield*/, db.user.findMany({
                            where: {
                                chatRooms: {
                                    some: {
                                        chatRoomId: message.chatRoomId,
                                    },
                                },
                            },
                        })];
                case 1:
                    users = _a.sent();
                    subs = users
                        .filter(function (user) { return user.email !== message.userEmail; })
                        .map(function (user) { return user.subscriptions.map(function (sub) { return JSON.parse(sub); }); });
                    subs.forEach(function (sub) {
                        sub.forEach(function (s) {
                            console.log(s);
                            (0, web_push_1.sendNotification)(s, JSON.stringify(message)).catch(function (e) { });
                        });
                    });
                    return [4 /*yield*/, db.message.create({
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
                        })];
                case 2:
                    prismaMessage = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on("deleteMessage", function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var prismaMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    io.to(message.chatRoomId).emit("deleteMessage", __assign(__assign({}, message), { createdAt: new Date() }));
                    return [4 /*yield*/, db.message.delete({
                            where: {
                                id: message.id,
                            },
                        })];
                case 1:
                    prismaMessage = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
