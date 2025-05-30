import React from "react";
// import { signOut } from "firebase/auth";
// import { auth} from "../firebase";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
//   const navigate = useNavigate();
//   const { currentUser } = useAuth();
//   const handleLogout = async () => {
//     await signOut(auth);
//     navigate("/login");
//   };
 
  return (
    <div className="bg-gray-100 p-4 flex justify-between items-center">   
      {/* <p>Welcome, {currentUser?.email}</p> */} 
      <h1 className="text-xl font-bold">💬 Let's Talk</h1>
      {/* <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button> */}
    </div>
  );
};

export default Navbar;
