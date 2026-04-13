import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

/**
 * Generate access + refresh token
 */
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};

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

    // ✅ FIXED SPELLING HERE
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: "Verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
            ),
        });
    } catch (error) {
        console.error("Email error:", error);
    }

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
 * EXPORTS
 */
export {
    registerUser,
    generateAccessAndRefreshTokens,
    login,
    logoutUser,
    verifyEmail,
    refreshAccessToken,
};
