import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await axios.post("http://127.0.0.1:8000/login/", {
      username: formData.username,
      password: formData.password
    });

    const { access, refresh, username, role } = response.data;

    login(access, refresh, { username, role });

    // Redirect based on role
    if (role === 'instructor') {
      navigate("/dashboard2");
    } else if (role === 'student') {
      navigate("/dashboard");
    } else if (role === 'admin') {
      navigate("/admin-dashboard");
    } else {
      navigate("/"); // fallback
    }

  } catch (err) {
    setError("Invalid username or password");
    console.error("Login error:", err);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-purple-700 text-center">Login</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-full bg-purple-700 text-white py-3 rounded font-semibold hover:bg-purple-800 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}