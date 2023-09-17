import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");

    if (storedToken) {
      setAccessToken(storedToken); // Set access token from local storage
      fetchUserProfile(storedToken);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const tokenData = await response.json();
        const accessToken = tokenData.access;
        localStorage.setItem("jwtToken", accessToken);
        setAccessToken(accessToken);
        navigate("/landingpage");
        await fetchUserProfile(accessToken);
      } else {
        // const errorData = await response.json();
        toast.error("Invalid username or password", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
          );
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred while logging in.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    setAccessToken(null);
    setUser(null);
    navigate("/landingpage");
  };

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/profile/", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Fetch user profile error:", error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, accessToken, updateUser }}>
      {children}
      <ToastContainer />
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useAuth() {
  return useContext(AuthContext);
}
