import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    console.log("📧 Sending email...");

    // ✅ Transporter (FINAL FIXED CONFIG)
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: 587, // ✅ use 587
        secure: false, // required for 587
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false, // 🔥 fixes connection close issue
        },
    });

    // ✅ Mailgen setup
    const mailgenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Basecampy Task Manager",
            link: "http://localhost:3000",
        },
    });

    // ✅ Generate email content
    const emailHtml = mailgenerator.generate(options.mailgenContent);
    const emailText = mailgenerator.generatePlaintext(options.mailgenContent);

    // ✅ Email object
    const mail = {
        from: "noreply@basecampy.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml,
    };

    try {
        const info = await transporter.sendMail(mail);
        console.log("✅ MAIL SENT:", info.messageId);
    } catch (error) {
        console.error("❌ EMAIL ERROR:", error);
    }
};

// 📧 Email verification template
const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Basecampy! We're excited to have you onboard.",
            action: {
                instruction: "Click below to verify your email:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: verificationUrl,
                },
            },
            outro: "If you did not create an account, no further action is required.",
        },
    };
};

// 🔐 Forgot password template
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "You requested a password reset.",
            action: {
                instruction: "Click below to reset your password:",
                button: {
                    color: "#0bb99c",
                    text: "Reset Password",
                    link: passwordResetUrl,
                },
            },
            outro: "If you didn’t request this, ignore this email.",
        },
    };
};

export {
    sendEmail,
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
};
