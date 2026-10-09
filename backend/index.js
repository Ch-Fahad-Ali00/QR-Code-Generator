import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import User from "./models/User.js";
import Url from "./models/Url.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });



// Add user
app.post("/add-data", async (req, res) => {
    try {
        const { name, email, contact, password } = req.body;

        const newUser = new User({
            name,
            email,
            contact,
            password
        });

        const savedUser = await newUser.save();

        res.status(201).json(savedUser);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to add user",
            error: error.message
        });
    }
});



    // URL to the backend

    app.post("/add-url", async (req, res) => {
    try {

        const url = req.body.input;

        const newUrl = new Url({
            url: url
        });

        const savedUrl = await newUrl.save();

        res.status(201).json(savedUrl);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to add URL",
            error: error.message
        });
    }
});





app.listen(process.env.PORT, () => {
    console.log(`Server Started on port ${process.env.PORT}`);
});