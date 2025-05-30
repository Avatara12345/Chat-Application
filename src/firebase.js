// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAm81VLZwicxZ-pHK_m2TFm-NJIp1vz68Y",
  authDomain: "chatapplication-f1aa8.firebaseapp.com",
  projectId: "chatapplication-f1aa8",
  storageBucket: "chatapplication-f1aa8.firebasestorage.app",
  messagingSenderId: "23992284108",
  appId: "1:23992284108:web:2d9d0e339bd9679021e369"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider,db };