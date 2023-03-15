import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import env from "./environment.js";
import fs from "fs";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
import { createPost } from "./controllers/posts.js";

/** CONFIGURATION */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
if ((env.name = "development")) app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extented: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/** CREATE UPLOAD DESTINATION */
const createDestinationMiddleware = (req, res, next) => {
  const folderName = "public/assets";
  try {
    fs.mkdirSync(folderName, { recursive: true });
    next();
  } catch (err) {
    console.error("index --> createDestinationMiddleware :", err);
    res.status(500).json({ msg: "error in creating destination for upload" });
  }
};

/** File Storage */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/** ROUTES WITH FILES */

app.post(
  "/auth/register",
  createDestinationMiddleware,
  upload.single("picture"),
  register
);

app.post(
  "/posts",
  verifyToken,
  createDestinationMiddleware,
  upload.single("picture"),
  createPost
);

/** ROUTES */

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.use("/posts", postRoutes);

/** MONGOOSE SETUP */

const PORT = process.env.PORT || 6001;
mongoose
  .connect(env.db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port : ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
