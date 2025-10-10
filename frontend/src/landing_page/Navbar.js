import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

    // Function to update user state
    const updateUserState = () => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setIsLoggedIn(true);
            setUsername(userData.username || userData.email);
        } else {
            setIsLoggedIn(false);
            setUsername('');
        }
    };

    // Listen for login event
    useEffect(() => {
        // Check initial state
        updateUserState();

        // Listen for login event
        const handleLogin = (event) => {
            const userData = event.detail.user;
            setIsLoggedIn(true);
            setUsername(userData.username || userData.email);
        };

        window.addEventListener('userLogin', handleLogin);

        // Cleanup
        return () => {
            window.removeEventListener('userLogin', handleLogin);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user'); // Remove user data
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Clear cookie
        setIsLoggedIn(false);
        setUsername('');
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg border-bottom" style={{ backgroundColor: "#FFF" }}>
            <div className="container p-2">
                <Link className="navbar-brand" to="/">
                    <img src='media/images/logo.svg' style={{ width: "25%" }} alt='logo' />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">About</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Products</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/pricing">Pricing</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/support">Support</Link>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center">
                        {isLoggedIn ? (
                            <>
                                <span className="nav-link me-3">
                                    Welcome, <b style={{ color: '#2563eb' }}>{username}</b>
                                </span>
                                <a
                                    href="http://localhost:3001/"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary me-2"
                                >
                                    Dashboard
                                </a>
                                <button 
                                    onClick={handleLogout}
                                    className="btn btn-outline-danger"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
                                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </nav>
    );
}

export default Navbar;