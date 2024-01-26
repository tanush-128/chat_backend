import express from "express";
import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import sharp from "sharp";
import fs from "fs";
const wss = new WebSocketServer({ port: 3002 });

wss.on("connection", function connection(ws) {
  console.log("connected");
  ws.on("close", function close() {
    console.log("disconnected");
  });
  ws.send("send-file");
  ws.on("message", function incoming(message) {
    console.log(message);
    // sharp(message as ArrayBuffer, {
    //   unlimited: true,
    //   failOnError: false,
    // }).toFile("output.jpg", (err, info) => {
    //   if (err) {
    //     console.error("Error converting Buffer to image:", err);
    //   } else {
    //     console.log("Image saved successfully:", info);
    //   }
    // });
  });
});
