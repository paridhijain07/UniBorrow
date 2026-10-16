import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Search,
  Send,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Check,
  CheckCheck,
  MapPin,
  Sparkles,
  ExternalLink,
  X,
  RefreshCw,
  MessageCircle,
  HelpCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import { getConversations, getThread, sendMessage } from "../api/messages.api";
import { useAuth } from "../hooks/useAuth.js";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = rawApiUrl.replace(/\/api\/?$/, "");

// Date formatting helpers
const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatDateDivider = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  if (isSameDay(d, today)) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatConversationTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  if (isSameDay(d, today)) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

// Quick campus action chips
const QUICK_PROMPTS = [
  "👋 Hi, is this item still available?",
  "📍 Can we meet at the Central Library?",
  "☕ I'm at the Campus Canteen now",
  "📦 Ready for pickup at the hub!",
  "✅ Item returned in great condition. Thanks!",
];

const ChatPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();

  // Conversations sidebar state
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'unread'
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Active thread state
  const [activeMessages, setActiveMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Socket & Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch conversations list
  const fetchConversationsList = async () => {
    try {
      const res = await getConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversationsList();
  }, []);

  // 2. Fetch active thread when userId changes
  useEffect(() => {
    if (!userId) {
      setActiveMessages([]);
      setActiveUser(null);
      setIsPeerTyping(false);
      return;
    }

    let isMounted = true;
    setThreadLoading(true);
    setIsPeerTyping(false);

    getThread(userId)
      .then((res) => {
        if (!isMounted) return;
        setActiveMessages(res.messages || []);
        setActiveUser(res.otherUser || null);

        // Mark conversation as read locally in sidebar
        setConversations((prev) =>
          prev.map((c) =>
            c.otherUser?._id === userId ? { ...c, unreadCount: 0 } : c
          )
        );
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch thread:", err);
        toast.error("Could not load chat messages");
      })
      .finally(() => {
        if (isMounted) setThreadLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // 3. Socket initialization and live presence & message subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit("register", user.id);

    // Initial presence check
    socket.emit("get_online_users", (onlineIds) => {
      if (Array.isArray(onlineIds)) {
        setOnlineUsers(new Set(onlineIds));
      }
    });

    socket.on("user_online", (uid) => {
      setOnlineUsers((prev) => new Set(prev).add(uid));
    });

    socket.on("user_offline", (uid) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
    });

    socket.on("user_typing", ({ senderId, isTyping }) => {
      if (senderId === userId) {
        setIsPeerTyping(isTyping);
      }
    });

    socket.on("receive_private_message", (msg) => {
      // A. If msg belongs to current open thread, append it
      if (msg.sender === userId || msg.receiver === userId) {
        setActiveMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      // B. Update conversation list snippet, unread counter, and sort order
      setConversations((prev) => {
        const peerId = msg.sender === user.id ? msg.receiver : msg.sender;
        const existingIdx = prev.findIndex((c) => c.otherUser?._id === peerId);

        if (existingIdx !== -1) {
          const currentConv = prev[existingIdx];
          const isViewingThisThread = peerId === userId;
          const updated = {
            ...currentConv,
            lastMessage: msg,
            unreadCount: isViewingThisThread ? 0 : (currentConv.unreadCount || 0) + 1,
          };
          const rest = [...prev];
          rest.splice(existingIdx, 1);
          return [updated, ...rest];
        } else {
          // Brand new conversation: refresh from API
          fetchConversationsList();
          return prev;
        }
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, userId]);

  // 4. Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isPeerTyping]);

  // 5. Typing handler
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socketRef.current && userId) {
      socketRef.current.emit("typing", {
        senderId: user.id,
        receiverId: userId,
        isTyping: true,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("typing", {
            senderId: user.id,
            receiverId: userId,
            isTyping: false,
          });
        }
      }, 1500);
    }
  };

  // 6. Send message
  const handleSend = async (customText) => {
    const textToSend = (typeof customText === "string" ? customText : inputText).trim();
    if (!textToSend || !userId || isSending) return;

    setInputText("");
    setIsSending(true);

    // Cancel typing status immediately
    if (socketRef.current) {
      socketRef.current.emit("typing", {
        senderId: user.id,
        receiverId: userId,
        isTyping: false,
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    try {
      const res = await sendMessage({
        receiverId: userId,
        text: textToSend,
      });

      const newMsg = res?.message || {
        _id: Date.now().toString(),
        sender: user.id,
        receiver: userId,
        text: textToSend,
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Append to active thread
      setActiveMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });

      // Update sidebar conversation card
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.otherUser?._id === userId);
        const peerData = activeUser || (idx !== -1 ? prev[idx].otherUser : { _id: userId, name: "Student" });
        const updatedEntry = {
          otherUser: peerData,
          lastMessage: newMsg,
          unreadCount: 0,
        };

        if (idx === -1) {
          return [updatedEntry, ...prev];
        }
        const rest = [...prev];
        rest.splice(idx, 1);
        return [updatedEntry, ...rest];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to deliver message. Please retry.");
      setInputText(textToSend); // Restore unsent message
    } finally {
      setIsSending(false);
      // Re-focus input
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let list = [...conversations];

    // If viewing a user who isn't in existing conversations yet (e.g. initiated from item details),
    // include a temporary entry at the top so they appear selected in the sidebar
    if (userId && activeUser && !list.some((c) => c.otherUser?._id === userId)) {
      list.unshift({
        otherUser: activeUser,
        lastMessage: {
          text: "Start the conversation...",
          timestamp: new Date().toISOString(),
          sender: activeUser._id,
          read: true,
        },
        unreadCount: 0,
        isDraft: true,
      });
    }

    return list.filter((c) => {
      const nameMatch = (c.otherUser?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const msgMatch = (c.lastMessage?.text || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesSearch = nameMatch || msgMatch;
      if (!matchesSearch) return false;

      if (filterTab === "unread") {
        return (c.unreadCount || 0) > 0;
      }
      return true;
    });
  }, [conversations, activeUser, userId, searchQuery, filterTab]);

  // Total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [conversations]);

  // Is active user online
  const isActiveUserOnline = userId ? onlineUsers.has(userId) : false;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5 h-[calc(100vh-5.5rem)] min-h-[580px] flex flex-col animate-page-fade">
      <div className="flex-1 flex overflow-hidden rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative">
        
        {/* ======================================================== */}
        {/* LEFT PANE: CONVERSATION LIST (SIDEBAR)                   */}
        {/* ======================================================== */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0d131f] transition-all duration-300 ${
            userId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200/70 dark:border-slate-800/70 space-y-3 shrink-0 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-[#f97316] flex items-center justify-center font-black">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Messages
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Campus Peer Direct Connect
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {totalUnreadCount > 0 && (
                  <span className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                    {totalUnreadCount} new
                  </span>
                )}
                <button
                  type="button"
                  onClick={fetchConversationsList}
                  title="Refresh conversations"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search peers or messages..."
                className="w-full bg-slate-100/80 dark:bg-[#161f30] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-transparent focus:border-orange-500/50 focus:bg-white dark:focus:bg-[#1a2438] outline-none transition-all duration-200 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-[#161f30] p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-1 px-3 rounded-lg transition-all text-center ${
                  filterTab === "all"
                    ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Chats
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("unread")}
                className={`flex-1 py-1 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  filterTab === "unread"
                    ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Unread</span>
                {totalUnreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/70 dark:divide-slate-800/50">
            {conversationsLoading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-24" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {searchQuery ? "No matches found" : "No conversations yet"}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  {searchQuery
                    ? "Try a different name or message keyword."
                    : "Browse catalog items and message student owners to arrange borrowings!"}
                </p>
                {!searchQuery && (
                  <Link
                    to="/browse"
                    className="mt-4 text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20"
                  >
                    Browse Items →
                  </Link>
                )}
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.otherUser?._id === userId;
                const isOnline = onlineUsers.has(c.otherUser?._id);
                const hasUnread = (c.unreadCount || 0) > 0;
                const isMe = c.lastMessage?.sender === user?.id;

                return (
                  <button
                    type="button"
                    key={c.otherUser?._id}
                    onClick={() => navigate(`/chat/${c.otherUser._id}`)}
                    className={`w-full text-left p-3.5 flex items-center gap-3.5 transition-all duration-200 relative group cursor-pointer ${
                      isSelected
                        ? "bg-orange-500/10 dark:bg-orange-500/15 border-l-4 border-l-[#f97316]"
                        : "hover:bg-slate-100/80 dark:hover:bg-[#151d2d]/80 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* User Avatar + Online Ring */}
                    <div className="relative shrink-0">
                      <img
                        src={c.otherUser?.avatar || "/default-avatar.svg"}
                        alt={c.otherUser?.name || "Student"}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#111827] shadow-xs ${
                          isOnline
                            ? "bg-emerald-500 ring-2 ring-emerald-400/30"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                        title={isOnline ? "Active on campus now" : "Offline"}
                      />
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`font-bold text-xs truncate ${
                              isSelected
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {c.otherUser?.name || "Fellow Student"}
                          </span>
                          {c.otherUser?.verifiedBadge && (
                            <ShieldCheck
                              className="w-3.5 h-3.5 text-blue-500 shrink-0"
                              title="Verified Campus Student"
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                          {formatConversationTime(c.lastMessage?.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs truncate ${
                            hasUnread
                              ? "font-bold text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {isMe && <span className="text-slate-400">You: </span>}
                          {c.lastMessage?.text || "Started conversation"}
                        </p>

                        {hasUnread && (
                          <span className="shrink-0 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Pickup Zone badge if available */}
                      {c.otherUser?.pickupZone && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                          <MapPin className="w-2.5 h-2.5 text-orange-500" />
                          <span>{c.otherUser.pickupZone}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANE: ACTIVE CHAT THREAD OR EMPTY SELECTION STATE   */}
        {/* ======================================================== */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/40 dark:bg-[#0b0f19] ${
            !userId ? "hidden md:flex" : "flex"
          }`}
        >
          {!userId ? (
            /* --- EMPTY DESKTOP STATE --- */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 dark:from-orange-500/30 dark:to-transparent flex items-center justify-center text-[#f97316] ring-8 ring-orange-500/5 shadow-inner">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-[#111827]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                Your Campus Messaging Center
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                Coordinate handovers, clarify item condition, schedule returns, and stay in direct touch with peer borrowers across campus.
              </p>

              {/* Campus Safety Checklist Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl w-full text-left">
                <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                    Verified Pickup Hubs
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Always arrange exchanges at high-visibility campus spots like the Central Library or Canteen.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                    Pre-Borrow Inspection
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Test electronics and inspect item accessories together upon handover before accepting.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                    Prompt Return Release
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Confirm return in your Bookings tab to promptly close agreements and release deposits.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* --- ACTIVE CHAT THREAD VIEW --- */
            <>
              {/* Thread Header */}
              <div className="px-4 py-3 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0 shadow-xs z-10">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Back to all conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Peer Avatar + Status */}
                  <div className="relative shrink-0">
                    <img
                      src={activeUser?.avatar || "/default-avatar.svg"}
                      alt={activeUser?.name || "Student"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#111827] ${
                        isActiveUserOnline
                          ? "bg-emerald-500 ring-2 ring-emerald-400/30"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                  </div>

                  {/* Peer Information */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {activeUser?.name || "Fellow Student"}
                      </span>
                      {activeUser?.verifiedBadge && (
                        <ShieldCheck
                          className="w-4 h-4 text-blue-500"
                          title="Verified Campus Student"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      {isActiveUserOnline ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active now
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Offline</span>
                      )}

                      {activeUser?.pickupZone && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-0.5 font-medium">
                            <MapPin className="w-3 h-3 text-orange-500" />
                            {activeUser.pickupZone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2">
                  {activeUser?._id && (
                    <Link
                      to={`/profile/${activeUser._id}`}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 px-3 py-1.5 rounded-xl transition-all border border-slate-200/60 dark:border-slate-700/60"
                      title="View student profile"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Message Feed Container */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 bg-slate-50/50 dark:bg-[#0b0f19]">
                {threadLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-orange-500/20 border-t-[#f97316] rounded-full animate-spin" />
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      Start your conversation with {activeUser?.name || "this student"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Say hello, confirm item availability, or pick a campus spot below to organize a smooth handover!
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg, index) => {
                    const isMe = msg.sender === user?.id;
                    const prevMsg = activeMessages[index - 1];
                    const showDateDivider =
                      !prevMsg ||
                      !isSameDay(new Date(msg.timestamp), new Date(prevMsg.timestamp));

                    return (
                      <div key={msg._id || index} className="space-y-3">
                        {/* Date Separator Pill */}
                        {showDateDivider && (
                          <div className="flex justify-center my-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-white dark:bg-[#161f30] px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-800/80 shadow-2xs">
                              {formatDateDivider(msg.timestamp)}
                            </span>
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-200`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[72%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed transition-all ${
                              isMe
                                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-tr-xs"
                                : "bg-white dark:bg-[#151d2d] text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 rounded-tl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                            <div
                              className={`text-[10px] mt-1 flex items-center justify-end gap-1 font-semibold ${
                                isMe ? "text-orange-100" : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              <span>{formatMessageTime(msg.timestamp)}</span>
                              {isMe && (
                                <span>
                                  {msg.read ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-orange-200" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-orange-200/70" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Peer Typing Indicator */}
                {isPeerTyping && (
                  <div className="flex justify-start animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#151d2d] border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-sm flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {activeUser?.name || "Peer"} is typing
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Campus Quick Action Chips */}
              <div className="px-4 py-2 bg-slate-100/70 dark:bg-[#0e1422] border-t border-slate-200/70 dark:border-slate-800/70 overflow-x-auto flex items-center gap-2 no-scrollbar">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-500" /> Quick:
                </span>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="shrink-0 text-xs font-semibold bg-white dark:bg-[#161f30] hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 px-3 py-1 rounded-full transition-all duration-150 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <div className="p-3 bg-white dark:bg-[#111827] border-t border-slate-200/80 dark:border-slate-800/80 flex items-end gap-2.5 shrink-0 shadow-sm relative z-10">
                <div className="flex-1 bg-slate-100/80 dark:bg-[#161f30] rounded-2xl border border-slate-200/80 dark:border-slate-800 focus-within:border-orange-500/60 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all flex items-center px-3.5 py-1.5">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Press Enter to send)"
                    className="w-full bg-transparent resize-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none max-h-32 py-1 font-medium leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isSending}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-2xl font-bold transition-all duration-200 shadow-md shadow-orange-500/25 active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                  title="Send message (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPage;
