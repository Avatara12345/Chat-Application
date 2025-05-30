import React, { useEffect, useState } from "react";
import { FaUsers, FaComments } from "react-icons/fa";
import {
  query,
  collection,
  onSnapshot,
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../Context/AuthContext";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { LiaCheckDoubleSolid } from "react-icons/lia";

const ChatLayout = ({ onSelectUser }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatData, setChatData] = useState({}); // { chatId: { user, lastMessage, unreadCount } }
  const [typingStatus, setTypingStatus] = useState({});
  const navigate = useNavigate();

  // Fetch all users except current user
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.uid !== currentUser?.uid);
      setUsers(allUsers);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // Fetch chats and setup real-time listeners for messages and unread counts
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribeChats = onSnapshot(
      query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUser.uid)
      ),
      async (snapshot) => {
        const unsubscribers = [];
        const newChatData = {};

        // Process each chat
        for (const chatDoc of snapshot.docs) {
          const chatId = chatDoc.id;
          const participants = chatDoc.data().participants;
          const otherUserId = participants.find((id) => id !== currentUser.uid);
          const otherUser = users.find((u) => u.uid === otherUserId);

          if (otherUser) {
            // Initialize chat data
            newChatData[chatId] = {
              user: otherUser,
              lastMessage: null,
              unreadCount: 0,
            };

            // Set up message listener for last message
            const messagesRef = collection(db, "chats", chatId, "messages");
            const messagesQuery = query(
              messagesRef,
              orderBy("createdAt", "desc"),
              limit(1)
            );

            const unsubMessages = onSnapshot(messagesQuery, (querySnapshot) => {
              if (!querySnapshot.empty) {
                const lastMsg = querySnapshot.docs[0].data();
                setChatData((prev) => ({
                  ...prev,
                  [chatId]: {
                    ...prev[chatId],
                    lastMessage: {
                      text: lastMsg.text,
                      timestamp: lastMsg.createdAt?.toDate(),
                      senderId: lastMsg.senderId,
                      status: lastMsg.status,
                      isDeleted: lastMsg.isDeleted,
                      file: lastMsg.file,
                      fileType: lastMsg.fileType,
                    },
                  },
                }));
              }
            });

            // Set up unread count listener
            const unreadQuery = query(
              messagesRef,
              where("receiverId", "==", currentUser.uid),
              where("status", "in", ["sent", "delivered"])
            );

            const unsubUnread = onSnapshot(unreadQuery, (snapshot) => {
              setChatData((prev) => ({
                ...prev,
                [chatId]: {
                  ...prev[chatId],
                  unreadCount: snapshot.size,
                },
              }));
            });

            unsubscribers.push(unsubMessages, unsubUnread);
          }
        }

        // Initialize with the users we found
        setChatData(newChatData);

        return () => unsubscribers.forEach((unsub) => unsub());
      }
    );

    return () => unsubscribeChats();
  }, [currentUser?.uid, users]);

  const handleSelectUser = async (user) => {
    const combinedId = [currentUser.uid, user.uid].sort().join("_");

    try {
      const chatRef = doc(db, "chats", combinedId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, user.uid],
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
      }

      onSelectUser(user);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const getLastMessagePreview = (lastMessage) => {
    if (!lastMessage) return null;

    const isCurrentUser = lastMessage.senderId === currentUser.uid;
    let previewText = "";

    if (lastMessage.isDeleted) {
      previewText = "🚫 Message deleted";
    } else if (lastMessage.file) {
      previewText = lastMessage.fileType?.startsWith("image/")
        ? "📷 Photo"
        : "📄 File";
    } else {
      previewText = lastMessage.text || "";
    }

    return {
      text: isCurrentUser ? `You: ${previewText}` : previewText,
      time: lastMessage.timestamp?.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isCurrentUser,
      status: lastMessage.status,
    };
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <FiCheck className="text-gray-500 text-xs" />;
      case "delivered":
        return <LiaCheckDoubleSolid className="text-gray-500 text-xs" />;
      case "read":
        return <LiaCheckDoubleSolid className="text-blue-500 text-xs" />;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const filteredChatData = Object.entries(chatData).filter(([chatId, data]) => {
    const fullName =
      `${data.user.firstname} ${data.user.lastname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubs = Object.keys(chatData).map((chatId) => {
      const user = chatData[chatId].user;
      const typingRef = doc(db, "chats", chatId, "typingStatus", user.uid);

      return onSnapshot(typingRef, (doc) => {
        setTypingStatus((prev) => ({
          ...prev,
          [chatId]: doc.exists() ? doc.data().isTyping : false,
        }));
      });
    });

    return () => unsubs.forEach((unsub) => unsub());
  }, [chatData, currentUser?.uid]);

  return (
    <div className="w-full h-screen border-r flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-2xl font-bold">💬 Let's Talk</h1>
        <div className="flex space-x-2">
          <button className="p-2 rounded text-xl hover:bg-gray-100">
            <FaUsers />
          </button>
          <button className="p-2 rounded text-xl hover:bg-gray-100">
            <FaComments />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <input
          type="text"
          placeholder="Search user"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {searchTerm && filteredUsers.length > 0 && (
          <>
            <h2 className="text-gray-600 font-semibold">New Users</h2>
            {filteredUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => handleSelectUser(user)}
                className="p-3 rounded-lg border border-l hover:bg-gray-100 cursor-pointer"
              >
                <h3 className="font-semibold">
                  {user.firstname} {user.lastname}
                </h3>
              </div>
            ))}
          </>
        )}

        {filteredChatData.length > 0 && (
          <>
            {searchTerm && (
              <h2 className="text-gray-600 font-semibold">Chats</h2>
            )}
            {filteredChatData.map(([chatId, data]) => {
              const lastMessage = getLastMessagePreview(data.lastMessage);
              const unreadCount = data.unreadCount || 0;
              const user = data.user;

              return (
                <div
                  key={chatId}
                  onClick={() => handleSelectUser(user)}
                  className="p-3 rounded-lg border border-l hover:bg-gray-100 cursor-pointer relative"
                  style={{ backgroundColor: "#c2c2be" }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">
                      {user.firstname} {user.lastname}
                    </h3>
                    {lastMessage?.time && (
                      <span className="text-xs text-gray-500">
                        {lastMessage.time}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    {typingStatus[chatId] ? (
                      <div className="flex space-x-1 items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                      </div>
                    ) : lastMessage ? (
                      <p className="text-sm text-gray-600 truncate max-w-[180px]">
                        {lastMessage.text}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">No messages yet</p>
                    )}
                    <div className="flex items-center gap-1">
                      {lastMessage?.isCurrentUser &&
                        renderStatusIcon(lastMessage.status)}
                      {unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {!searchTerm && filteredChatData.length === 0 && (
          <p className="text-gray-500 text-center">
            No chats yet. Start a new conversation!
          </p>
        )}
      </div>

      <div className="border-t px-4 py-3 bg-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              {currentUser?.firstname || "Logged-in User"}
            </p>
            <p className="text-sm text-gray-700">{currentUser?.email}</p>
          </div>
          <button
            onClick={() => signOut(auth).then(() => navigate("/login"))}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
