import React, { useState } from "react";
import Sidebar from "../Component/Sidebar";
import ChatWindow from "../Component/ChatWindow";
import ChatLayout from "../Component/ChatLayout";
// import ContactList from "../Component/ContactList";
import { useAuth } from "../Context/AuthContext";

const Home = () => {
  const { currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  // const activeChat = selectedUser 
  // ? currentUser.uid > selectedUser.uid
  //   ? currentUser.uid + "_" + selectedUser.uid
  //   : selectedUser.uid + "_" + currentUser.uid
  // : null;
  return (
    <>
    
      <div className="flex h-screen bg-slate-100">
        {/* <div className="w-[5%] border-r">
          <Sidebar />
        </div> */}

        <div className="w-[20%] border-r">
          <ChatLayout onSelectUser={setSelectedUser} />
        </div>

        <div className="w-[75%] ">
          <ChatWindow selectedUser={selectedUser} currentUser={currentUser} />
        </div>
      </div>
    </>
  );
};

export default Home;
