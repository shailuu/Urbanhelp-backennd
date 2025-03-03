const { z } = require("zod");

const signupSchema = z.object({
    username: z
        .string({ required_error: "Username is required" })
        .trim()
        .min(3, { message: "Username must have at least 3 characters" })
        .max(100, { message: "Username must have less than 100 characters" }),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Invalid email format" })
        .max(100, { message: "Email must have less than 100 characters" })
        .refine((email) => /@(gmail\.com|yahoo\.com)$/.test(email), {
            message: "Email must be from gmail.com or yahoo.com",
        }),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password must have less than 100 characters" })
        .trim()
        // .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        // .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        // .regex(/[\W_]/, { message: "Password must contain at least one special character" }),
});

const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Invalid email format" })
        .max(100, { message: "Email must have less than 100 characters" }),

    password: z
        .string({ required_error: "Password is required" })
        .trim()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password must have less than 100 characters" }),
});

module.exports = { signupSchema, loginSchema };
