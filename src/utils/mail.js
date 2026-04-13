import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    // Transporter should be inside or outside, but must use Number for port
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: Number(process.env.MAILTRAP_SMTP_PORT),
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mailgenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Basecampy Task Manager",
            link: "http://localhost:3000",
        },
    });

    const emailHtml = mailgenerator.generate(options.mailgenContent);
    const emailText = mailgenerator.generatePlaintext(options.mailgenContent);

    const mail = {
        from: "noreply@basecampy.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mail);
        console.log(`Email sent to: ${options.email} ✅`);
    } catch (error) {
        console.error("Email failed ❌", error.message);
    }
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Basecampy! We're excited to have you onboard.",
            action: {
                instruction: "To verify your account, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Verify Your Email",
                    link: verificationUrl,
                },
            },
            outro: "If you did not create an account, no further action is required.",
        },
    };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "You are receiving this email because we received a password reset request for your account.",
            action: {
                instruction: "Click the button below to reset your password:",
                button: {
                    color: "#0bb99c",
                    text: "Reset Password",
                    link: passwordResetUrl,
                },
            },
            outro: "If you did not request a password reset, please ignore this email.",
        },
    };
};

export {
    sendEmail,
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
};
