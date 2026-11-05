import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Url from "./models/Url.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log("MongoDB Connection Error:", err));

/* ---------- AUTH MIDDLEWARE ---------- */
const auth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = header.split(" ")[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

/* ---------- SIGNUP (add-data) ---------- */
app.post("/add-data", async (req, res) => {
    try {
        const { name, email, contact, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const emailDomain = email.split("@")[1].toLowerCase();
        const blockedDomains = [
            "xyz.com", "example.com", "test.com", "domain.com", "abc.com",
            "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com", "yopmail.com"
        ];
        if (blockedDomains.includes(emailDomain)) {
            return res.status(400).json({ message: "Please use a real email provider." });
        }

        const cleanedContact = contact.replace(/[\s-]/g, '');
        const intlPhoneRegex = /^\+?[1-9]\d{9,14}$/;
        if (!intlPhoneRegex.test(cleanedContact)) {
            return res.status(400).json({ message: "Invalid phone number format." });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const userCount = await User.countDocuments();
        const role = userCount === 0 ? "admin" : "user";

        const newUser = new User({ name, email, contact: cleanedContact, password, role });
        const savedUser = await newUser.save();

        res.status(201).json({
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to add user", error: error.message });
    }
});

/* ---------- LOGIN ---------- */
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const rawName = email.split("@")[0];
            const fallbackName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            const displayName = process.env.ADMIN_NAME || fallbackName;

            const token = jwt.sign(
                { id: "env-admin-id", email: email, role: "admin", name: displayName },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );
            return res.json({
                token,
                user: { _id: "env-admin-id", name: displayName, email: email, role: "admin" }
            });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

/* ---------- ADMIN: list all users ---------- */
app.get("/admin/users", auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
});

/* ---------- ADD URL (protected) ---------- */
app.post("/add-url", auth, async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) return res.status(400).json({ message: "URL required" });

        const newUrl = new Url({ url: input });
        const savedUrl = await newUrl.save();
        res.status(201).json(savedUrl);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to add URL", error: error.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server Started on port ${process.env.PORT}`);
});