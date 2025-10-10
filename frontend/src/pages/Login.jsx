import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-left",
      autoClose: 2000, // Will auto close after 2 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!inputValue.email || !inputValue.password) {
        handleError("Please fill in all fields");
        return;
      }

      console.log("Sending login request with data:", inputValue);
      const response = await axios.post(
        "http://localhost:3002/login",process.env.REACT_APP_API_URL,
        {
          ...inputValue,
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      console.log("Received response:", response);
      
      const { data } = response;
      console.log("Login response:", data);

      if (data.success) {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          const loginEvent = new CustomEvent('userLogin', { 
            detail: { user: data.user }
          });
          window.dispatchEvent(loginEvent);
        }
        
        toast.success(data.message, {
          position: "bottom-left",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          onClose: () => navigate("/")
        });
      } else {
        handleError(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        handleError(error.response.data.message || "Login failed");
      } else if (error.request) {
        handleError("No response from server. Please try again.");
      } else {
        handleError("Something went wrong. Please try again.");
      }
    }
    
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
          <div className="auth-divider">
            <span className="auth-divider-text">Don't have an account?</span>
          </div>
          <p className="auth-link">
            <Link to="/signup">Create a new account</Link>
          </p>
        </form>
        <ToastContainer
          position="bottom-left"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={true}
          pauseOnHover={false}
          theme="colored"
          limit={1}
        />
      </div>
    </div>
  );
};

export default Login;