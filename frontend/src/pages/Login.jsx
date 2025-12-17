import { useState } from "react";
import axios from "axios";
import "../style/login.css"; // We'll create this CSS file

export default function Login({ setUser, setShowLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      setUser(res.data.user);
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
      console.log(process.env.REACT_APP_API_URL)
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue to your account</p>
        </div>
        
        <div className="auth-form">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
          
          <button 
            className="auth-button" 
            onClick={login}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              "Sign In"
            )}
          </button>
          
          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          <div className="auth-footer">
            <p>Don't have an account?</p>
            <button 
              className="switch-button"
              onClick={() => setShowLogin(false)}
              disabled={isLoading}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}