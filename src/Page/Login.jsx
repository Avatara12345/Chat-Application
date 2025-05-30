// src/components/LoginForm.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();   

  const handleChange = (e) =>
     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast.success("Login Successfully");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.message);
      toast.error("Login failed");
    }
  };

  // const handleGoogleLogin = async () => {
  //   setError("");
  //   try {
  //     await signInWithPopup(auth, googleProvider);
  //     toast.success("Login Successfully"); 
  //     setTimeout(() => {
  //       navigate("/");
  //     }, 1000);
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  return (
    <>
      <ToastContainer position="top-right" autoClose={1000} />
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url(https://t3.ftcdn.net/jpg/02/02/17/98/240_F_202179808_o2YPAXShv0rdjQSso7mqOqSprYAvhKEM.jpg)",
        }}
      >
        {/* blur overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm"></div>
        {/* card */}
        <div className="relative z-10 bg-white shadow-xl rounded-lg px-8 py-10 w-full max-w-md text-center">
          {/* icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-white w-14 h-14 rounded-full shadow flex items-center justify-center -mt-16 border">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-6">Welcome back!</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form className="space-y-4 text-left" onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-md transition duration-300"
            >
              Login
            </button>
          </form>

{/*       
          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full border border-gray-300 py-3 rounded-md hover:bg-gray-100 transition duration-300"
            >
              Sign in with Google
            </button>
          </div> */}

          <p className="mt-6 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-green-600 underline hover:text-green-800"
            >
              Sign Up!
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
