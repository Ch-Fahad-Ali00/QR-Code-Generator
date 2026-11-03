import axios from "axios";
import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { 
    parsePhoneNumberFromString, 
    getExampleNumber, 
    getCountryCallingCode,
    getCountries,
    AsYouType,
    getPhoneCode // Helper to get country code
} from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

const SignupForm = () => {
    const [f, setF] = useState({ name: "", email: "", contact: "", password: "", confirmPassword: "" });
    const [selectedCountryCode, setSelectedCountryCode] = useState("PK");
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // Generate all countries
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

    // 🟢 REAL-TIME RESTRICTION LOGIC
    const handleContactChange = (e) => {
        let rawValue = e.target.value;
        
        // 1. Strip out anything that isn't a number
        rawValue = rawValue.replace(/[^\d]/g, '');

        // 2. Strict rule for Pakistan: Must start with 0 or 3, and max 11 digits
        if (selectedCountryCode === "PK") {
            // Only allow digits 0-9, but specifically enforce the starting digit
            if (rawValue.length > 0) {
                const firstChar = rawValue[0];
                // If they type a 4, 5, 6, etc., don't let them type it
                if (!['0', '3'].includes(firstChar)) {
                    return; 
                }
            }
            // Hard limit for PK length (11 digits max: 03001234567)
            if (rawValue.length > 11) {
                rawValue = rawValue.slice(0, 11);
            }
        } else {
            // For other countries, let libphonenumber handle the max length
            const formatter = new AsYouType(selectedCountryCode);
            const testFormat = formatter.input(rawValue);
            
            // If they exceed the valid length, chop off the extra digit
            if (formatter.getNumber() && formatter.getNumber().length > 15) {
                rawValue = rawValue.slice(0, -1);
            }
        }

        // 3. Apply the formatting (adds spaces automatically)
        const formatter = new AsYouType(selectedCountryCode);
        const formattedValue = formatter.input(rawValue);

        setF({ ...f, contact: formattedValue });
        if (errors.contact) setErrors({ ...errors, contact: "" });
    };

    const onChange = (e) => {
        setF({ ...f, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        let newErrors = {};
        
        // 1. Email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(f.email)) {
            newErrors.email = "Please enter a valid email address.";
        } else {
            const domain = f.email.split("@")[1].toLowerCase();
            const blocked = ["xyz.com","example.com","test.com","mailinator.com","tempmail.com"];
            if (blocked.includes(domain)) newErrors.email = "Please use a real email provider.";
        }

        // 2. Phone
        const cleanContact = f.contact.replace(/[\s-]/g, '');
        const fullPhone = `${selectedCountry.dialCode}${cleanContact}`;
        const phoneNumber = parsePhoneNumberFromString(fullPhone);
        
        if (!phoneNumber || !phoneNumber.isValid()) {
            newErrors.contact = `Invalid phone number for ${selectedCountry.name}.`;
        }

        // 3. Password
        if (f.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }
        if (f.password !== f.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const cleanContact = f.contact.replace(/[\s-]/g, '');
        const finalContact = `${selectedCountry.dialCode}${cleanContact}`;
        
        const payload = { 
            name: f.name, 
            email: f.email, 
            contact: finalContact, 
            password: f.password,
            confirmPassword: f.confirmPassword
        };

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
                            setF({ ...f, contact: "" }); 
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
                        onChange={handleContactChange} 
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
                    type={showPassword ? "text" : "password"} 
                    required 
                    className={`w-full outline-blue-300 rounded-md p-2 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-200'}`} 
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="mb-3 relative">
                <label className="block text-sm text-gray-700 mb-1">Confirm Password:</label>
                <input 
                    name="confirmPassword" 
                    value={f.confirmPassword} 
                    onChange={onChange} 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    className={`w-full outline-blue-300 rounded-md p-2 pr-10 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`} 
                />
                <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
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