import { useState } from "react";
import axios from "axios";
import "../style/login.css";

export default function Register({ setShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const register = async () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });
      alert("Registered successfully! Please login.");
      setShowLogin(true);
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      register();
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join our community today</p>
        </div>
        
        <div className="auth-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <p className="password-hint">At least 6 characters</p>
          </div>
          
          <button 
            className="auth-button" 
            onClick={register}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              "Create Account"
            )}
          </button>
          
          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          <div className="auth-footer">
            <p>Already have an account?</p>
            <button 
              className="switch-button"
              onClick={() => setShowLogin(true)}
              disabled={isLoading}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}