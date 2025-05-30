import React from "react";
import {
  FaComments,
  FaUser,
  FaStar,
  FaPencilAlt,
  FaCog,
  FaPowerOff,
} from "react-icons/fa";
import { BsChatLeftText } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import ChatLayout from "./ChatLayout";

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  return (
    <div className="w-full h-screen bg-white flex flex-col items-center py-4 justify-between">
      <div className="flex flex-col items-center gap-10">
        {/* <div className="bg-green-500 p-2 rounded-full">
          <FaComments className="text-white text-xl" />
        </div> */}
        <BsChatLeftText className="text-green-500 text-xl" />
        <div className="relative">
          <FaUser className="text-xl text-gray-700" />
        </div>
        <FaStar className="text-xl text-gray-700" />
      </div>
      <div className="flex flex-col items-center gap-10">
        <FaPencilAlt className="text-xl text-gray-700" />
        <FaCog className="text-xl text-gray-700" />
        <div onClick={handleLogout}>
          <FaPowerOff className="text-xl text-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
