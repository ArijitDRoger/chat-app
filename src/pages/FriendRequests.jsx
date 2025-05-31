// src/pages/FriendRequest.jsx
import React, { useState } from "react";
import { auth } from "../services/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

export default function FriendRequest() {
  const [uniqueId, setUniqueId] = useState("");
  const [message, setMessage] = useState("");

  const sendRequest = async () => {
    setMessage("");
    if (!uniqueId.trim()) {
      setMessage("Please enter a unique ID.");
      return;
    }

    try {
      // Find user by uniqueId (assuming uniqueId is stored as `uniqueId` field)
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uniqueId", "==", uniqueId.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage("User not found.");
        return;
      }

      const targetDoc = querySnapshot.docs[0];
      const targetUserId = targetDoc.data().uid;

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMessage("You are not logged in.");
        return;
      }

      if (targetUserId === currentUser.uid) {
        setMessage("You cannot send a request to yourself.");
        return;
      }

      // Check if already friends or request sent - Optional enhancement: Implement this check

      // Add friend request to target user's friendRequests array
      const targetDocRef = doc(db, "users", targetUserId);

      await updateDoc(targetDocRef, {
        friendRequests: arrayUnion({
          from: currentUser.uid,
          timestamp: serverTimestamp(),
        }),
      });

      setMessage("Friend request sent.");
      setUniqueId("");
    } catch (error) {
      console.error("Error sending friend request:", error);
      setMessage("Failed to send friend request.");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 400 }}>
      <h4>Send Friend Request</h4>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Enter friend's unique ID"
        value={uniqueId}
        onChange={(e) => setUniqueId(e.target.value)}
      />
      <button className="btn btn-primary w-100" onClick={sendRequest}>
        Send Request
      </button>
      {message && <div className="mt-2">{message}</div>}
    </div>
  );
}
