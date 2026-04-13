import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

/**
 * REGISTER USER
 */
const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = new User({
        email,
        username,
        password,
        isEmailVerified: false,
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save();

    // 🔥 EMAIL CALL (no try-catch so error will show)
    console.log("🔥 Calling sendEmail...");

    await sendEmail({
        email: user.email,
        subject: "Verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { user: createdUser },
                "User registered successfully",
            ),
        );
});

/**
 * LOGIN
 */
const login = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {}, "Login working"));
});

/**
 * LOGOUT
 */
const logoutUser = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {}, "Logout working"));
});

/**
 * VERIFY EMAIL
 */
const verifyEmail = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {}, "Email verified"));
});

/**
 * REFRESH TOKEN
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, {}, "Token refreshed"));
});

/**
 * EXPORTS (IMPORTANT)
 */
export { registerUser, login, logoutUser, verifyEmail, refreshAccessToken };
