// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUser();
  }, []);

  if (!userData) return <div>Loading profile...</div>;

  return (
    <div>
      <h2>Your Profile</h2>
      <p>
        <b>Email:</b> {userData.email}
      </p>
      <p>
        <b>Your Unique ID:</b> {userData.uniqueId}
      </p>
      <p>
        <b>Friends:</b> {userData.friends?.length || 0}
      </p>
    </div>
  );
}
