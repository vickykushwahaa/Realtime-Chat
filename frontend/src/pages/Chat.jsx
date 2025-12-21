import { useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios";
import { FaUsers, FaComments, FaPaperPlane, FaBars, FaTimes } from "react-icons/fa";

export default function Chat({ user }) {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Responsive breakpoints
  const MOBILE_BREAKPOINT = 768;
  const TABLET_BREAKPOINT = 1024;

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < MOBILE_BREAKPOINT);
      
      // Auto-show/hide sidebar based on screen size
      if (width < MOBILE_BREAKPOINT) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive styles based on screen size
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    sidebar: {
      width: isMobile ? '100%' : windowWidth < TABLET_BREAKPOINT ? '200px' : '300px',
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.2)',
      padding: isMobile ? '15px' : '20px',
      boxShadow: '5px 0 15px rgba(0, 0, 0, 0.1)',
      overflowY: 'auto',
      position: isMobile ? 'fixed' : 'relative',
      height: isMobile ? '100%' : '100vh',
      zIndex: 1000,
      left: showSidebar ? '0' : '-100%',
      transition: 'left 0.3s ease',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
      display: isMobile && showSidebar ? 'block' : 'none'
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(5px)',
      width: '100%',
      minWidth: 0 // Prevents flex overflow
    },
    mobileHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    toggleButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px'
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '15px' : '12px 15px',
      margin: '8px 0',
      background: 'white',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      width: '100%',
      border: '1px solid transparent',
      '&:hover': {
        borderColor: '#667eea'
      }
    },
    avatar: {
      width: isMobile ? '50px' : '40px',
      height: isMobile ? '50px' : '40px',
      minWidth: isMobile ? '50px' : '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      marginRight: isMobile ? '15px' : '12px',
      fontSize: isMobile ? '18px' : '16px'
    },
    messageBubble: (isMe) => ({
      maxWidth: isMobile ? '85%' : '70%',
      padding: isMobile ? '15px' : '12px 16px',
      margin: '8px 0',
      borderRadius: '18px',
      wordWrap: 'break-word',
      wordBreak: 'break-word',
      fontSize: isMobile ? '15px' : '14px',
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
    inputContainer: {
      display: 'flex',
      padding: isMobile ? '15px' : '20px',
      background: 'white',
      borderTop: '1px solid #eaeaea',
      gap: '10px',
      position: 'sticky',
      bottom: 0,
      width: '100%',
      boxSizing: 'border-box'
    },
    input: {
      flex: 1,
      padding: isMobile ? '12px 15px' : '15px 20px',
      border: '2px solid #eaeaea',
      borderRadius: '25px',
      fontSize: isMobile ? '16px' : '15px',
      outline: 'none',
      transition: 'all 0.3s ease',
      minWidth: 0 // Prevents flex overflow
    },
    sendButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: isMobile ? '0 20px' : '0 30px',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      fontSize: isMobile ? '14px' : '16px',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    messagesContainer: {
      flex: 1,
      padding: isMobile ? '15px' : '20px',
      overflowY: 'auto',
      background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)',
      WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
    },
    chatHeader: {
      padding: isMobile ? '15px' : '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
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
      const selectedUser = users.find(u => u._id === receiverId);
      setChatUser(selectedUser);
      setMessages([]);
      socket.emit("joinChat", res.data._id);
      
      // On mobile, close sidebar when chat starts
      if (isMobile) {
        setShowSidebar(false);
      }
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
      {/* Mobile Overlay */}
      {isMobile && showSidebar && (
        <div 
          style={styles.overlay} 
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Mobile Close Button */}
        {isMobile && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            marginBottom: '15px'
          }}>
            <button 
              onClick={() => setShowSidebar(false)}
              style={styles.toggleButton}
            >
              <FaTimes />
            </button>
          </div>
        )}

        <h2 style={{ 
          margin: 0, 
          fontSize: isMobile ? '20px' : '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaUsers /> Hi, {user?.email?.split('@')[0] || 'User'}
        </h2>
        <p style={{ 
          color: '#666', 
          marginTop: '5px',
          fontSize: isMobile ? '14px' : '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <FaUsers style={{ fontSize: '12px' }} /> <b>{users.length}</b> online
        </p>
        
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ 
            marginBottom: '15px', 
            color: '#444', 
            fontSize: isMobile ? '16px' : '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaComments /> Chat with:
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No users available
            </div>
          ) : (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr',
              gap: '10px'
            }}>
              {users.map((u) => (
                <div 
                  key={u._id} 
                  style={{
                    ...styles.userItem,
                    background: currentChat?.participants?.includes(u._id) 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'white',
                    color: currentChat?.participants?.includes(u._id) ? 'white' : 'inherit'
                  }}
                  onClick={() => startChat(u._id)}
                  onMouseEnter={(e) => {
                    if (!currentChat?.participants?.includes(u._id)) {
                      e.currentTarget.style.background = '#f0f2ff';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!currentChat?.participants?.includes(u._id)) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div style={styles.avatar}>
                    {getInitials(u.email)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: '500', 
                      fontSize: isMobile ? '16px' : '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {u.email.split('@')[0]}
                    </div>
                    <div style={{ 
                      fontSize: isMobile ? '13px' : '12px', 
                      color: currentChat?.participants?.includes(u._id) 
                        ? 'rgba(255,255,255,0.8)' 
                        : '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {u.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {/* Mobile Header with Menu Button */}
        {isMobile && (
          <div style={styles.mobileHeader}>
            <button 
              onClick={() => setShowSidebar(true)}
              style={styles.toggleButton}
            >
              <FaBars />
            </button>
            <div style={{ flex: 1, marginLeft: '15px' }}>
              {currentChat ? (
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  {chatUser?.email?.split("@")[0]}
                </h3>
              ) : (
                <h3 style={{ margin: 0, color: '#666' }}>Select a conversation</h3>
              )}
            </div>
          </div>
        )}

        {/* Desktop Chat Header */}
        {!isMobile && (
          <div style={styles.chatHeader}>
            {currentChat ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.avatar}>
                  {getInitials(chatUser?.email)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>
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
        )}

        {/* Messages Container */}
        <div style={styles.messagesContainer}>
          {!currentChat ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#666',
              textAlign: 'center',
              padding: isMobile ? '20px' : '40px'
            }}>
              <div style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <FaComments style={{ fontSize: isMobile ? '40px' : '50px', color: '#667eea' }} />
              </div>
              <h3 style={{ 
                fontSize: isMobile ? '20px' : '24px',
                marginBottom: '10px'
              }}>
                No conversation selected
              </h3>
              <p style={{ 
                fontSize: isMobile ? '14px' : '16px',
                color: '#888'
              }}>
                {isMobile ? 'Tap menu button to select a user' : 'Choose someone from the sidebar to start chatting'}
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#666',
              textAlign: 'center',
              padding: isMobile ? '20px' : '40px'
            }}>
              <div style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <FaPaperPlane style={{ fontSize: isMobile ? '40px' : '50px', color: '#667eea' }} />
              </div>
              <h3 style={{ 
                fontSize: isMobile ? '20px' : '24px',
                marginBottom: '10px'
              }}>
                No messages yet
              </h3>
              <p style={{ 
                fontSize: isMobile ? '14px' : '16px',
                color: '#888'
              }}>
                Send your first message to start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={styles.messageBubble(msg.senderId === user._id)}>
                <div style={{ 
                  fontSize: isMobile ? '13px' : '12px', 
                  opacity: 0.8, 
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  {msg.senderId === user._id
                    ? 'You'
                    : chatUser?.email?.split("@")[0]}
                </div>
                <div style={{ lineHeight: 1.4 }}>{msg.text}</div>
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
          <div style={styles.inputContainer}>
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
              <FaPaperPlane /> {!isMobile && 'Send'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}