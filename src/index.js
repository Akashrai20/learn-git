import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

// ✅ Load env first
dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection error", err);
        process.exit(1);
    });
