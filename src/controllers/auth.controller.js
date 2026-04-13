import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

/**
 * @description Generates both access and refresh tokens for a user
 * @param {string} userId
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
        throw new ApiError(
            500,
            "Something went wrong while generating access token",
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // 1. Validation - check for empty fields
    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 2. Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // 3. Create user instance (but don't save to DB yet)
    const user = new User({
        email,
        password,
        username,
        isEmailVerified: false,
    });

    // 4. Generate verification token BEFORE saving
    // This is more efficient than saving, then updating, then saving again
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemproryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    // 5. Save the user with tokens in one go
    await user.save();

    // 6. Send verification email
    try {
        await sendEmail({
            email: user.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
            ),
        });
    } catch (error) {
        // Log the error but don't crash; the user can request a resend later
        console.error("Email sending failed:", error);
    }

    // 7. Remove sensitive fields from the response object
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user",
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { user: createdUser },
                "User registered successfully. Please check your email to verify your account.",
            ),
        );
});

export { registerUser, generateAccessAndRefreshTokens };
