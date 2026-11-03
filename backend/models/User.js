import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // Contact is now optional because our hardcoded admin won't have one
    contact: { type: String, required: false, default: "N/A" },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;