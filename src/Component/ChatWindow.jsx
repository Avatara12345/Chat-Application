import React, { useEffect, useState, useRef } from "react";
import { MdDelete } from "react-icons/md";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { MdOutlineAttachFile, MdClose  } from "react-icons/md";
import Lottie from "lottie-react";
import animations from "../animation/animation.json";
import { FiCheck } from "react-icons/fi";
import { LiaCheckDoubleSolid } from "react-icons/lia";

const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join("_");
};

const ChatWindow = ({ selectedUser, currentUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    msgId: null,
  });
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatId =
    selectedUser && currentUser
      ? getChatId(currentUser.uid, selectedUser.uid)
      : null;

  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      snapshot.docs.forEach(async (docSnap) => {
        const msg = docSnap.data();
        if (msg.receiverId === currentUser.uid && msg.status === "sent") {
          await updateDoc(doc(db, "chats", chatId, "messages", docSnap.id), {
            status: "delivered",
          });
        }

      });
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    const markMessagesAsRead = async () => {
      const unreadMsgs = messages.filter(
        (msg) => msg.receiverId === currentUser.uid && msg.status !== "read"
      );

      for (const msg of unreadMsgs) {
        await updateDoc(doc(db, "chats", chatId, "messages", msg.id), {
          status: "read",
          seenAt: serverTimestamp(),
        });
      }
    };

    if (selectedUser && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, selectedUser]);


  // Scroll to bottom on new message
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 
  useEffect(() => {
    if (!chatId) return;

    const typingDocRef = doc(db, "chats", chatId, "typingStatus", selectedUser.uid);
    const unsubscribe = onSnapshot(typingDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOtherTyping(data.isTyping);
      } else {
        setOtherTyping(false);
      }
    });

    return () => unsubscribe();
  }, [chatId, selectedUser]);


  const updateTypingStatus = async (isTyping) => {
    if (!chatId) return;

    const typingDocRef = doc(db, "chats", chatId, "typingStatus", currentUser.uid);
    await setDoc(
      typingDocRef,
      { isTyping },
      { merge: true }
    );
  };


  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      updateTypingStatus(false);
    }, 1500);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");

      let fileData = null;
      let fileType = null;

      if (selectedFile) {
        fileData = await fileToBase64(selectedFile);
        fileType = selectedFile.type;
      }

      await addDoc(messagesRef, {
        text: message,
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        file: fileData,
        fileType: fileType,
        createdAt: serverTimestamp(),
        status: "sent",
        seenAt: null,
      });

      setMessage("");
      setSelectedFile(null);
      // setPreviewUrl(null);
      setShowEmojiPicker(false);
      setTyping(false);
      updateTypingStatus(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (selectedFile) {
        URL.revokeObjectURL(selectedFile);
      }
    };
  }, [selectedFile]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-2xl text-gray-900">
        Select a user to start chatting 💬
      </div>
    );
  }

  return (
    <div
      className="flex flex-col flex-1 h-screen"
      style={{
        backgroundImage:
          "url(https://t3.ftcdn.net/jpg/02/02/17/98/240_F_202179808_o2YPAXShv0rdjQSso7mqOqSprYAvhKEM.jpg)",
      }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b font-semibold text-2xl bg-white">
          Chat With {selectedUser.firstname}  {selectedUser.lastname}
             
               {otherTyping && (
            <div className="text-sm text-gray-600 italic">Typing...</div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-2 relative">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded w-fit ${
                msg.senderId === currentUser.uid
                  ? "bg-blue-100 ml-auto text-right"
                  : "bg-green-100 text-left"
              }`}
            >
              <p className={msg.isDeleted ? "italic text-gray-500" : ""}>
                {msg.text}
              </p>

              {!msg.isDeleted &&
                msg.file &&
                msg.fileType?.startsWith("image/") && (
                  <img
                    src={msg.file}
                    alt="sent"
                    className="max-w-xs mt-2 rounded"
                  />
                )}

              {!msg.isDeleted &&
                msg.file &&
                msg.fileType === "application/pdf" && (
                  <a
                    href={msg.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-2 block"
                  >
                    📄 View PDF
                  </a>
                )}
              <span className="text-xs text-gray-500 block">
                {msg.createdAt?.toDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {msg.senderId === currentUser.uid && (
                  <div className="">
                    {msg.status === "sent" && (
                      <FiCheck className="text-gray-500" />
                    )}
                    {msg.status === "delivered" && (
                      <LiaCheckDoubleSolid className="text-gray-500" />
                    )}
                    {msg.status === "read" && (
                      <LiaCheckDoubleSolid className="text-blue-500" />
                    )}
                  </div>
                )}
              </span>
              {!msg.isDeleted && msg.senderId === currentUser.uid && (
                <button
                  onClick={() =>
                    setDeleteConfirm({ show: true, msgId: msg.id })
                  }
                  className="top-0 right-0 text-red-400 hover:text-red-700 text-sm p-1"
                >
                  <MdDelete />
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {selectedFile && (
          <div className="mt-3 mx-4 bg-white rounded-lg p-3 shadow-md flex items-center gap-4 animate-slide-up w-32">
            <div className="w-24 h-10 z-40 absolute">
              <Lottie animationData={animations} loop={true} />
            </div>

            {selectedFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                className="w-20 h-20 object-cover rounded"
              />
            ) : selectedFile.type === "application/pdf" ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl">📄</span>
                <a
                  href={URL.createObjectURL(selectedFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View PDF
                </a>
              </div>
            ) : (
              <div className="text-sm text-gray-700 truncate">
                {selectedFile.name}
              </div>
            )}
            <button
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700 text-xl ml-auto top-0 right-0  absolute"
              title="Cancel"
            >
              <MdClose />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 p-5 border-t bg-white relative">
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="text-gray-700"
          >
            <BsEmojiSmile />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-3 z-50">
              <EmojiPicker
                width={250}
                height={300}
                onEmojiClick={handleEmojiClick}
              />
            </div>
          )}

          <label htmlFor="fileInput">
            <MdOutlineAttachFile
              size={20}
              className="text-gray-700 cursor-pointer"
            />
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              if (e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
                // setPreviewUrl(URL.createObjectURL(e.target.files[0]));
              }
            }}
            className="hidden"
          />

          <textarea
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type your message here..."
            className="resize-none flex-1 rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() && !selectedFile}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoSend size={22} />
          </button>
        </div>

        {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center space-y-4">
            <p className="text-lg font-semibold text-gray-800">
              Delete this message?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  await updateDoc(
                  
                    doc(db, "chats", chatId, "messages", deleteConfirm.msgId),
                    {
                      isDeleted: true,
                      text: "🚫 This message was deleted",
                    }
                  );
                  setDeleteConfirm({ show: false, msgId: null });
                }}
                className=" text-green-400 px-4 py-1 rounded "
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirm({ show: false, msgId: null })}
                className=" text-gray-800 px-4 py-1 rounded "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ChatWindow;
