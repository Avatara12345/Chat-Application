import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addUserToFirestore = async (user, extraData = {}) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstname: extraData.firstname || "",
        lastname: extraData.lastname || "",
        email: user.email,
      
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await addUserToFirestore(res.user, formData);
      toast.success("Signup Successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      const res = await signInWithPopup(auth, googleProvider);
  
      // Get user's full name from Google account
      const fullName = res.user.displayName || "";
      const [firstname, ...rest] = fullName.split(" ");
      const lastname = rest.join(" ");
      await addUserToFirestore(res.user, {
        firstname: firstname || "",
        lastname: lastname || "",
      });
  
      toast.success("Signup Successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url(https://t3.ftcdn.net/jpg/02/02/17/98/240_F_202179808_o2YPAXShv0rdjQSso7mqOqSprYAvhKEM.jpg)",
      }}
    >
      <ToastContainer position="top-right" autoClose={1000} hideProgressBar={false} closeOnClick pauseOnHover />
      <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm"></div>
      <div className="relative z-10 bg-white shadow-xl rounded-lg px-8 py-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-white w-14 h-14 rounded-full shadow flex items-center justify-center -mt-16 border">
            <span className="text-2xl">💬</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-6">Create account</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form className="space-y-4 text-left" onSubmit={handleRegister}>
          <input
            type="text"
            name="firstname"
            placeholder="Firstname"
            value={formData.firstname}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="Lastname"
            value={formData.lastname}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
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
            Register
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleGoogleSignup}
            className="w-full border border-gray-300 py-3 rounded-md hover:bg-gray-100 transition duration-300"
          >
            Sign up with Google
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-600 underline hover:text-green-800"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
