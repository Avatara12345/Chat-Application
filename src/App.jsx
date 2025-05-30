import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Page/Login";
import SignUp from "./Page/SignUp";
import Home from "./Page/Home";
import ProtectedRoute from "./Component/ProtectedRoute";
import Navbar from "./Component/Navbar";
import { useAuth } from "./Context/AuthContext";
// import ContactList from "./Component/ContactList";
function App() {
  const { currentUser } = useAuth();
  return (
    <>
      <Router>
      {/* {currentUser ? (
      <Navbar /> 
    ) : (
      <p>Please login to access chat</p>
    )} */}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route path="/contacts" element={<ContactList/>} /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
