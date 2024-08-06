import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import EventRouter from "./routes/events.js";
// Load environment variables from .env file
dotenv.config();

const app = express();
// Enable CORS for all routes
app.use(cors());
// app.disable('x-powered-by'); // security thing
app.use(express.json());
app.use(cors());

// const allowedOrigins = ["http://localhost:9400", "http://localhost:3000"]; // Add other origins as needed

// // CORS middleware configuration
// const corsOptions = {
//   origin: (origin: any, callback: any) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };

// app.use(cors(corsOptions));

axios.defaults.withCredentials = true;

app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;
const mongoURL = process.env.MONGO_URL ?? "";

// Secret key for signing JWT
const ACCESS_TOKEN_SECRET = "vercel-deployment";

// app.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find(
//     (u: any) => u.username === username && u.password === password
//   );

//   if (user) {
//     const accessToken = jwt.sign(
//       { username: user.username, id: user.username },
//       ACCESS_TOKEN_SECRET
//     );
//     res.json({ accessToken });
//   } else {
//     res.sendStatus(401);
//   }
// });

// // Middleware to authenticate JWT
// const authenticateToken = (req: any, res: any, next: any) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, ACCESS_TOKEN_SECRET, (err: any, user: any) => {
//     if (err) {
//       return res.status(403).send({
//         err,
//       });
//     }
//     req.user = user;
//     next();
//   });
// };

// app.get('/data', authenticateToken, (req, res) => {
//   res.json({ message: 'This is protected data' });
// });

// Define your REST API endpoints

app.get("/api", (req: any, res: any) => {
  res.json({ message: "Hello, this is your REST API running on Vercel!" });
});

app.get("/api/hello", (req: any, res: any) => {
  res.json({ message: "Hello from another endpoint!" });
});

// Route to generate a token
app.post("/api/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
  res.json({ accessToken });
});

app.use("/api/v1/event", EventRouter);

app.use("/", (req: any, res: any) => {
  res.status(200).send({ message: "Hello, Server is up and running!" });
});

// Start the server

mongoose
  .connect(mongoURL, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  });

export default app;
