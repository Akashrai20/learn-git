import { Router } from "express";
import {
    registerUser,
    login,
    logoutUser,
    verifyEmail,
    refreshAccessToken,
} from "../controllers/auth.controller.js";

// 1. DELETE OR COMMENT OUT THE MIDDLEWARE IMPORT
// import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);

// 2. REMOVE 'verifyJWT' FROM THE LOGOUT ROUTE
router.route("/logout").post(logoutUser);

export default router;

// import { Router } from "express";
// import { registerUser } from "../controllers/auth.controller.js";

// const router = Router();

// router.route("/register").post(registerUser);

// export default router;
