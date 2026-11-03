import axios from "axios";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { saveAuth } from "./auth";

const LoginForm = () => {
    const navigate = useNavigate();
    const [formFields, setFormFields] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const { email, password } = formFields;

    const handleChange = (e) => {
        setFormFields({ ...formFields, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const validate = () => {
        let newErrors = {};
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        } else {
            const emailDomain = email.split("@")[1].toLowerCase();
            const blockedDomains = [
                "xyz.com", "example.com", "test.com", "domain.com", "abc.com",
                "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com", "yopmail.com"
            ];
            if (blockedDomains.includes(emailDomain)) {
                newErrors.email = "Please use a real email provider (e.g., Gmail, Yahoo).";
            }
        }

        if (!password) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClick = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const { data } = await axios.post("http://localhost:5000/login", {
                email,
                password
            });
            saveAuth(data.token, data.user);
            navigate("/QrCodeGenerator");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <form onSubmit={handleClick} className="lg:w-[50%] md:w-[70%] sm:w-[90%] border border-gray-200 shadow-lg mx-auto rounded-md mt-20 p-5 bg-white">
            <div className="mx-auto text-center text-3xl my-4">
                <h1 className="text-blue-400 font-medium">Login</h1>
            </div>

            <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">Email:</label>
                <input
                    name="email" 
                    value={email} 
                    onChange={handleChange}
                    type="email" 
                    required 
                    placeholder="Enter your email ..."
                    className={`w-full outline-blue-300 rounded-md p-2 border ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="relative mb-3">
                <label className="block text-sm text-gray-700 mb-1">Password:</label>
                <input
                    name="password" 
                    value={password} 
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"} // Toggle type here
                    required 
                    placeholder="Enter password ..."
                    className={`w-full outline-blue-300 rounded-md p-2 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                />
                {/* Eye Button */}
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button 
                type="submit" 
                className="w-full bg-blue-500 py-2 px-4 rounded-md active:scale-98 hover:bg-blue-700 text-white font-semibold mx-auto block cursor-pointer mt-4"
            >
                Login
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
                New user? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
            </p>
        </form>
    );
};

export default LoginForm;