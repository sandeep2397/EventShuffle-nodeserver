/**
 * Module dependencies.
 */

import http from "http";
import app from "./app.js";
import fs from "fs";
import mongoose, { Connection } from "mongoose";

let httpServer: http.Server;
/**
 * Create HTTP server.
 */
const mongoURL = process.env.MONGO_URL ?? "";

let httpsInternalPort: number;
export let httpsExternalPort: number;
if (
  !!process.env.HTTPS &&
  process.env.HTTPS_KEY_PATH &&
  process.env.HTTPS_CERT_PATH
) {
  /**
   * Create HTTPS server.
   */
  // provide key/cert pem files as one line env variables replacing newLine sign with \n
  const options = {
    key: fs.readFileSync(process.env.HTTPS_KEY_PATH ?? "", {
      encoding: "utf-8",
    }),
    cert: fs.readFileSync(process.env.HTTPS_CERT_PATH ?? "", {
      encoding: "utf-8",
    }),
  };

  // redirect http to https
  httpServer = http.createServer(function (req, res) {
    res.writeHead(301, {
      Location:
        "https://" +
        req.headers["host"]?.split(":")[0] +
        ":" +
        httpsExternalPort +
        req.url,
    });
    res.end();
  });
} else {
  /**
   * Create HTTP server.
   */
  httpServer = http.createServer(app);
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
  const p: number = parseInt(val, 10);

  if (Number.isNaN(p)) {
    // named pipe
    return val;
  }

  if (p >= 0) {
    // port number
    return p;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
export const port: number = normalizePort(process.env.PORT || "3001");
app.set("port", port);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe  ${port}` : `Port  ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.log(`${bind} requires elevated privileges`);
      console.error(error);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(error);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP(S) server "listening" event.
 */
function onListening(server: http.Server) {
  console.log(`Listening on ${port}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */

mongoose
  .connect(mongoURL, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  })
  .then(() => {
    console.log("Connected to MongoDB");
    httpServer.listen(port);
    httpServer.on("error", onError);
    httpServer.on("listening", onListening);
  });
