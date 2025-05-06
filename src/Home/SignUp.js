import React, { useState } from "react";
import axios from "axios";

const StaffSignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: "Receptionist",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const res = await axios.post("http://localhost:8000/api/staff-signup/", formData);
      setMessage(res.data.message || "Signup successful!");
      setFormData({ username: "", password: "", email: "", role: "Receptionist" });
    } catch (error) {
      setErrors(error.response?.data || { non_field_errors: "Signup failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Staff Signup</h2>

        {/* Success Message */}
        {message && (
          <div style={styles.successMessage}>
            {message}
          </div>
        )}

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div style={styles.errorMessage}>
            {Object.entries(errors).map(([key, value], i) => (
              <div key={i}>{Array.isArray(value) ? value.join(", ") : value}</div>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="role" style={styles.label}>
              Role
            </label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="Receptionist">Receptionist</option>
              <option value="LabTechnician">Lab Technician</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>

        <div style={styles.loginLink}>
          Already have an account? <a href="/faculty-login" style={styles.link}>Log in</a>
        </div>
      </div>
    </div>
  );
};

// Styles object
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    color: '#555',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  buttonDisabled: {
    opacity: '0.7',
    cursor: 'not-allowed',
  },
  successMessage: {
    backgroundColor: '#dff0d8',
    color: '#3c763d',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
  },
  errorMessage: {
    backgroundColor: '#f2dede',
    color: '#a94442',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
  },
};

export default StaffSignupForm;