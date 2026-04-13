import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Added this

const app = express();

// Basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // Added this - CRITICAL for cookies

// CORS configurations
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Fixed typo: locahost -> localhost
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// Import routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";

// Routes declaration
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
    res.send("Welcome to basecampy");
});

export default app;
