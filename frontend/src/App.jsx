import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import QrCodeGenerator from "./QR-codeGenerator";
import AdminDashboard from "./AdminDashboard";
import { isLoggedIn, isAdmin } from "./auth";

const Protected = ({ children }) =>
    isLoggedIn() ? children : <Navigate to="/" replace />;

const AdminOnly = ({ children }) =>
    isLoggedIn() && isAdmin() ? children : <Navigate to="/QrCodeGenerator" replace />;

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/QrCodeGenerator" element={<Protected><QrCodeGenerator /></Protected>} />
            <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
        </Routes>
    </BrowserRouter>
);

export default App;