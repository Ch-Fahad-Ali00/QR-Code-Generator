import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getToken, getUser, logout } from "./auth";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const admin = getUser();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/admin/users", {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                setUsers(data);
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    logout();
                    navigate("/");
                    return;
                }
                setError(err.response?.data?.message || "Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Welcome, <span className="font-semibold">{admin?.name}</span> ({admin?.email})
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/QrCodeGenerator" 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg cursor-pointer transition active:scale-95"
                        >
                            Back to Generator
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition active:scale-95"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-blue-700">{users.length}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Admins</p>
                        <p className="text-2xl font-bold text-purple-700">
                            {users.filter(u => u.role === "admin").length}
                        </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Regular Users</p>
                        <p className="text-2xl font-bold text-green-700">
                            {users.filter(u => u.role === "user").length}
                        </p>
                    </div>
                </div>

                {/* Users Table */}
                {loading ? (
                    <p className="text-center text-gray-500 py-8">Loading users...</p>
                ) : error ? (
                    <p className="text-center text-red-500 py-8">{error}</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Name</th>
                                    <th className="px-4 py-3 font-semibold">Email</th>
                                    <th className="px-4 py-3 font-semibold">Contact</th>
                                    <th className="px-4 py-3 font-semibold">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">{u.name}</td>
                                        <td className="px-4 py-3">{u.email}</td>
                                        <td className="px-4 py-3">{u.contact || "N/A"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                u.role === "admin" 
                                                    ? "bg-purple-100 text-purple-700" 
                                                    : "bg-green-100 text-green-700"
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6 text-gray-500">
                                            No users found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;