import React, { useContext, useEffect, useState, createContext } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc,serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe =  onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        // mark user as online
        await updateDoc(userRef, {
          status: "online",
          lastSeen: serverTimestamp(),
        });
       
        window.addEventListener("beforeunload", async () => {
          await updateDoc(userRef, {
            status: "offline",
            lastSeen: serverTimestamp(),
          });
        });
  
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
