import axios from "axios";
import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { 
    parsePhoneNumberFromString, 
    getExampleNumber, 
    getCountryCallingCode,
    getCountries 
} from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

const SignupForm = () => {
    const [f, setF] = useState({ name: "", email: "", contact: "", password: "" });
    const [selectedCountryCode, setSelectedCountryCode] = useState("PK");
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const navigate = useNavigate();

    const allCountries = useMemo(() => {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
        const countryCodes = getCountries();

        return countryCodes.map(code => {
            try {
                const dialCode = `+${getCountryCallingCode(code)}`;
                return { code, name: displayNames.of(code) || code, dialCode };
            } catch (err) {
                return null;
            }
        }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const selectedCountry = allCountries.find(c => c.code === selectedCountryCode) || allCountries[0];

    const onChange = (e) => {
        setF({ ...f, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        let newErrors = {};
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(f.email)) {
            newErrors.email = "Please enter a valid email address.";
        } else {
            const domain = f.email.split("@")[1].toLowerCase();
            const blocked = ["xyz.com","example.com","test.com","mailinator.com","tempmail.com"];
            if (blocked.includes(domain)) newErrors.email = "Please use a real email provider.";
        }

        const fullPhone = `${selectedCountry.dialCode}${f.contact}`;
        const phoneNumber = parsePhoneNumberFromString(fullPhone);
        if (!phoneNumber || !phoneNumber.isValid()) {
            newErrors.contact = `Invalid phone number for ${selectedCountry.name}.`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const finalContact = `${selectedCountry.dialCode}${f.contact}`;
        const payload = { ...f, contact: finalContact };

        try {
            const { data } = await axios.post("http://localhost:5000/add-data", payload);
            alert(`Signup successful! Registered as ${data.role}. Please login.`);
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.message || "Signup failed");
        }
    };

    const examplePhone = getExampleNumber(selectedCountry.code, examples);
    const placeholderText = examplePhone ? examplePhone.formatNational() : "Enter phone number";

    return (
        <form onSubmit={submit} className="lg:w-[50%] md:w-[70%] sm:w-[90%] border border-gray-200 shadow-lg mx-auto rounded-md mt-20 p-5 bg-white">
            <h1 className="text-blue-400 text-3xl font-medium text-center my-4">Sign Up</h1>
            
            <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">Name:</label>
                <input name="name" value={f.name} onChange={onChange} type="text" required className="w-full outline-blue-300 rounded-md p-2 border border-gray-200" />
            </div>

            <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">Email:</label>
                <input name="email" value={f.email} onChange={onChange} type="email" required className={`w-full outline-blue-300 rounded-md p-2 border ${errors.email ? 'border-red-500' : 'border-gray-200'}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">Phone:</label>
                <div className="flex gap-2">
                    <select 
                        value={selectedCountryCode}
                        onChange={(e) => {
                            setSelectedCountryCode(e.target.value);
                            setErrors({ ...errors, contact: "" });
                        }}
                        className="w-[180px] outline-blue-300 rounded-md p-2 border border-gray-200 bg-gray-50 cursor-pointer text-sm"
                    >
                        {allCountries.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.code} {c.dialCode} - {c.name}
                            </option>
                        ))}
                    </select>

                    <input 
                        name="contact" 
                        value={f.contact} 
                        onChange={onChange} 
                        type="tel" 
                        required 
                        placeholder={placeholderText}
                        className={`flex-1 outline-blue-300 rounded-md p-2 border ${errors.contact ? 'border-red-500' : 'border-gray-200'}`} 
                    />
                </div>
                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
            </div>

            <div className="mb-3 relative">
                <label className="block text-sm text-gray-700 mb-1">Password:</label>
                <input 
                    name="password" 
                    value={f.password} 
                    onChange={onChange} 
                    type={showPassword ? "text" : "password"} // Toggle type here
                    required 
                    className="w-full outline-blue-300 rounded-md p-2 pr-10 border border-gray-200" 
                />
                {/* Eye Button */}
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
            </div>

            <button type="submit" className="bg-blue-500 py-2 px-4 rounded-md hover:bg-blue-700 text-white font-semibold mx-auto block cursor-pointer mt-4 w-full">
                Sign Up
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account? <Link to="/" className="text-blue-600 hover:underline">Login</Link>
            </p>
        </form>
    );
};

export default SignupForm;