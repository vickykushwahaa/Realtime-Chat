import { useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios";

export default function Chat({ user }) {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatUser, setChatUser] = useState(null);

  // Styles
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    sidebar: {
      width: '131px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '20px',
      boxShadow: '5px 0 15px rgba(0, 0, 0, 0.1)'
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(5px)'
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 15px',
      margin: '8px 0',
      background: 'white',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      marginRight: '12px'
    },
    messageBubble: (isMe) => ({
      maxWidth: '70%',
      padding: '12px 16px',
      margin: '8px 0',
      borderRadius: '18px',
      wordWrap: 'break-word',
      ...(isMe ? {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        marginLeft: 'auto',
        borderBottomRightRadius: '4px'
      } : {
        background: 'white',
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderBottomLeftRadius: '4px'
      })
    }),
    input: {
      flex: 1,
      padding: '15px 20px',
      border: '2px solid #eaeaea',
      borderRadius: '25px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    sendButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '0 30px',
      marginLeft: '10px',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    }
  };

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
      console.log("Joined socket room:", user._id);
    }
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
        setUsers(res.data.filter((u) => u._id !== user._id));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user._id]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const startChat = async (receiverId) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/chats`,
        {
          senderId: user._id,
          receiverId,
        }
      );

      setCurrentChat(res.data);

      // 🔥 THIS IS THE KEY
      const selectedUser = users.find(u => u._id === receiverId);
      setChatUser(selectedUser);

      setMessages([]);
      socket.emit("joinChat", res.data._id);
    } catch (err) {
      console.error(err);
    }
  };
  const sendMessage = () => {
    if (!currentChat?._id || !message.trim()) return;

    const msgData = {
      senderId: user._id,
      chatId: currentChat._id,
      text: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : '??';
  };
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={{ 
          margin: 0, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Hii, {user?.email?.split('@')[0] || 'User'}
        </h2>
        <p style={{ color: '#666', marginTop: '5px' }}>
         <b>{users.length}</b> online
        </p>
        
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#444', fontSize:'medium' }}>Chat with:</h3>
          {loading ? (
            <div>Loading users...</div>
          ) : (
            users.map((u) => (
              <div 
                key={u._id} 
                style={{
                  ...styles.userItem,
                  background: currentChat?.participants?.includes(u._id) ? '#667eea' : 'white',
                  color: currentChat?.participants?.includes(u._id) ? 'white' : 'inherit'
                }}
                onClick={() => startChat(u._id)}
                onMouseEnter={(e) => {
                  if (!currentChat?.participants?.includes(u._id)) {
                    e.currentTarget.style.background = '#cacee3ff';
                    e.currentTarget.style.transform = 'translateX(5px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!currentChat?.participants?.includes(u._id)) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                  }
                }}
              >
                {/* <div style={styles.avatar}>
                  {getInitials(u.email)}
                </div> */}
                <div>
                  <div style={{ fontWeight: '500' }}>
                    {u.email.split('@')[0]}
                  </div>
                  <div style={{ fontSize: '12px', color: currentChat?.participants?.includes(u._id) ? 'rgba(255,255,255,0.8)' : '#666' }}>
                    {/* {u.email} */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        <div style={{
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
         }}>
          {currentChat ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={styles.avatar}>
                {getInitials(chatUser?.email)}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>
                  Chat with {chatUser?.email?.split("@")[0]}
                </h3>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                  Online • Click to start chatting
                </p>
              </div>
            </div>
          ) : (
            <h3 style={{ margin: 0, color: '#666' }}>Select a conversation</h3>
          )}
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)'
        }}>
          {!currentChat ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#666'
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '80px', height: '80px', opacity: 0.5 }}>
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                <path d="M6 12h8v2H6zm0-3h12v2H6zm0-3h12v2H6z"/>
              </svg>
              <h3>No conversation selected</h3>
              <p>Choose someone from the sidebar to start chatting</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#666'
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '80px', height: '80px', opacity: 0.5 }}>
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <h3>No messages yet</h3>
              <p>Send your first message to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={styles.messageBubble(msg.senderId === user._id)}>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>
                  {msg.senderId === user._id
                    ? user.email.split("@")[0]
                    : chatUser?.email?.split("@")[0]}
                </div>
                <div>{msg.text}</div>
                <div style={{ 
                  fontSize: '11px', 
                  opacity: 0.7, 
                  marginTop: '5px', 
                  textAlign: 'right' 
                }}>
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        {currentChat && (
          <div style={{
            display: 'flex',
            padding: '20px',
            background: 'white',
            borderTop: '1px solid #eaeaea',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
          }}>
            <input
              style={{
                ...styles.input,
                borderColor: message.trim() ? '#667eea' : '#eaeaea',
                boxShadow: message.trim() ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
              }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
            />
            <button 
              style={{
                ...styles.sendButton,
                opacity: !message.trim() ? 0.5 : 1,
                cursor: !message.trim() ? 'not-allowed' : 'pointer'
              }}
              onClick={sendMessage}
              disabled={!message.trim()}
              onMouseEnter={(e) => {
                if (message.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}