// src/pages/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { signOut } from "firebase/auth";

function Chat() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // will hold only friends
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchFriends(firebaseUser.uid);
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchFriends = async (currentUserId) => {
    try {
      // Get current user's document
      const userDocRef = doc(db, "users", currentUserId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error("User document not found");
        setUsers([]);
        return;
      }

      const userData = userDocSnap.data();
      const friendIds = userData.friends || [];

      if (friendIds.length === 0) {
        setUsers([]); // no friends
        return;
      }

      // Fetch all users and filter by friendIds
      const usersSnapshot = await getDocs(collection(db, "users"));
      const friendsList = usersSnapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }))
        .filter((u) => friendIds.includes(u.uid));

      setUsers(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const getChatId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    if (unsubscribeRef.current) {
      unsubscribeRef.current(); // unsubscribe previous listener
    }

    const chatId = getChatId(auth.currentUser.uid, user.uid);

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data());
      setMessages(msgs);
      scrollToBottom();
    });
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    const chatId = getChatId(user.uid, selectedUser.uid);

    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        from: user.uid,
        to: selectedUser.uid,
        message: messageInput.trim(),
        timestamp: serverTimestamp(),
      });
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Check console for details.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <div
        className="d-flex flex-column border-end bg-white"
        style={{ width: "280px" }}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">Friends</h5>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        <ul className="list-group">
          {users.length === 0 && (
            <li className="list-group-item text-muted">No friends yet</li>
          )}
          {users.map((u) => (
            <li
              key={u.uid}
              onClick={() => selectUser(u)}
              className="list-group-item d-flex align-items-center"
              style={{ cursor: "pointer" }}
            >
              <img
                src={u.avatar}
                alt={u.nickname}
                className="rounded-circle me-2"
                width="40"
                height="40"
              />
              <span>{u.nickname}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-grow-1 d-flex flex-column">
        <header className="border-bottom bg-white p-3">
          <h5 className="mb-0">
            {selectedUser
              ? `Chatting with ${selectedUser.email}`
              : "Select a friend to start chatting"}
          </h5>
        </header>

        <main
          className="flex-grow-1 overflow-auto bg-white p-3 d-flex flex-column"
          style={{ minHeight: 0 }}
        >
          {!selectedUser ? (
            <div className="d-flex justify-content-center align-items-center text-muted flex-grow-1">
              No friend selected
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {messages.map((msg, idx) => {
                const isOwn = msg.from === user.uid;
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded ${
                      isOwn
                        ? "bg-primary text-white align-self-end rounded-3"
                        : "bg-secondary text-white align-self-start rounded-3"
                    }`}
                    style={{ maxWidth: "70%" }}
                  >
                    {msg.message}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {selectedUser && (
          <form
            className="d-flex border-top p-3 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;
