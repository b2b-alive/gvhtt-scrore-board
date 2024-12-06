import { io } from "socket.io-client";
import {LiveStreamConfig} from "./LiveStreamConfig";
import {LiveStream} from "./LiveStream";

const liveStream = new LiveStream();

const socket = io("https://fftt.dafunker.com:3000/livestream_zqsf-ygrz-b0d4-uv5z-bsbm", {
    transports: ["websocket"],
    rejectUnauthorized: false
});

socket.on("connect", () => {
    console.log("Connected");
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

socket.on("message", (message) => {
    console.log("Message", message);
});

socket.on("error", (error) => {
    console.error("Error", error);
});

socket.on("connect_error", (error) => {
    console.error("Connect error", error);
});

socket.on("connect_timeout", (timeout) => {
    console.error("Connect timeout", timeout);
});

socket.on("reconnect", (attempt) => {
    console.log("Reconnect", attempt);
});

socket.on("reconnect_attempt", (attempt) => {
    console.log("Reconnect attempt", attempt);
});

socket.on("reconnecting", (attempt) => {
    console.log("Reconnecting", attempt);
});

socket.on("reconnect_error", (error) => {
    console.error("Reconnect error", error);
});

socket.on("reconnect_failed", () => {
    console.error("Reconnect failed");
});

socket.on("ping", () => {
    console.log("Ping");
});

socket.on("pong", () => {
    console.log("Pong");
});

socket.on('update', (config: LiveStreamConfig) => {
    liveStream.config = config;
});