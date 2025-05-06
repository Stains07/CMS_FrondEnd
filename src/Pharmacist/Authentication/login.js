import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PharmacistLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        try {
            const response = await axios.post('http://localhost:8000/api/pharmacy/phar/login/', {
                username,
                password,
            });

            // Store the full response data in localStorage
            localStorage.setItem('userData', JSON.stringify(response.data));
            // Store the access token separately for authentication
            localStorage.setItem('token', response.data.data.access);

            alert("Login successful! Welcome, Pharmacist.");
            navigate('/pharmacist/dashboard');
        } catch (error) {
            console.error("Login error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card p-4 shadow bg-gradient-to-r from-blue-100 to-teal-100">
                        <h2 className="text-center mb-4 text-gray-800">Pharmacist Login</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-success w-100">
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacistLogin;