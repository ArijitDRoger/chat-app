// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC_2LoRbr_M0zIhU6KAxAxleMy_zCepMJI",
  authDomain: "chat-app-9fad2.firebaseapp.com",
  projectId: "chat-app-9fad2",
  storageBucket: "chat-app-9fad2.firebasestorage.app",
  messagingSenderId: "467975909317",
  appId: "1:467975909317:web:02d490e16d511c541e65ac",
  measurementId: "G-L47LDSFMR9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export both auth and db correctly
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
