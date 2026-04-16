import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getConversations } from "../api/messages.api";
import { useAuth } from "../hooks/useAuth.js";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Online statuses set Map: Add uid mapping directly
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getConversations();
        setConversations(res.conversations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Socket initialization for presence map only
  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io(SOCKET_URL);
    
    newSocket.emit("register", user.id);

    newSocket.emit("get_online_users", (onlineIds) => {
      setOnlineUsers(new Set(onlineIds));
    });

    newSocket.on("user_online", (uid) => {
      setOnlineUsers((prev) => new Set(prev).add(uid));
    });

    newSocket.on("user_offline", (uid) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(uid);
        return updated;
      });
    });

    return () => newSocket.disconnect();
  }, [user?.id]);

  if (loading) {
    return (
       <div className="max-w-3xl mx-auto p-6 space-y-4">
         <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
         {[...Array(4)].map((_, i) => (
             <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-2xl w-full"></div>
         ))}
       </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5] mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-md border border-white/40 dark:border-[#3f3f46] p-10 rounded-3xl text-center shadow-sm">
          <div className="text-4xl mb-4">💬</div>
          <div className="text-lg font-bold text-[#0f172a] dark:text-[#f4f4f5]">No conversations yet</div>
          <div className="text-[#64748b] mt-2">Start a conversation by messaging an item owner!</div>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => {
            const isOnline = onlineUsers.has(c.otherUser._id);
            return (
              <div
                key={c.otherUser._id}
                onClick={() => navigate(`/chat/${c.otherUser._id}`)}
                className="p-4 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border border-[#e2e8f0] dark:border-[#3f3f46] rounded-2xl cursor-pointer hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 flex items-center gap-4 group"
              >
                <div className="relative">
                  <img
                    src={c.otherUser.avatar || "/default-avatar.svg"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#3f3f46] shadow-sm transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#3f3f46] transition-colors duration-500 ${isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[#0f172a] dark:text-[#f4f4f5] text-lg flex items-center gap-2">
                    {c.otherUser.name}
                  </div>
                  <div className={`text-[15px] truncate mt-0.5 ${c.unreadCount > 0 ? 'text-[#0f172a] dark:text-[#f4f4f5] font-bold' : 'text-[#64748b] dark:text-[#a1a1aa] font-medium'}`}>
                    {c.lastMessage.sender === user.id ? 'You: ' : ''}{c.lastMessage.text}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">
                    {new Date(c.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="bg-gradient-to-br from-[#f97316] to-[#ea6c0a] text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      {c.unreadCount} NEW
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;