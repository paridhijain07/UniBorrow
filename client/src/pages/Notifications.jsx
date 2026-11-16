import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Calendar,
  MessageSquare,
  Star,
  PackageCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getNotifications,
  markAllRead,
} from "../api/notfications.api";

const getNotificationMeta = (type) => {
  switch (type) {
    case "booking_requested":
      return {
        icon: Calendar,
        cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        label: "Booking Request",
      };
    case "booking_approved":
      return {
        icon: CheckCircle2,
        cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        label: "Approved",
      };
    case "booking_rejected":
      return {
        icon: AlertCircle,
        cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        label: "Declined",
      };
    case "booking_returned":
      return {
        icon: PackageCheck,
        cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        label: "Returned",
      };
    case "new_message":
      return {
        icon: MessageSquare,
        cls: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        label: "Message",
      };
    case "review_received":
      return {
        icon: Star,
        cls: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
        label: "Review",
      };
    default:
      return {
        icon: Bell,
        cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        label: "Alert",
      };
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'bookings' | 'messages' | 'unread'

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickNotification = (n) => {
    if (n.type === "new_message") {
      navigate("/chat");
    } else if (n.relatedBooking) {
      navigate("/bookings");
    } else if (n.relatedItem) {
      navigate(`/item/${n.relatedItem}`);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread") return !n.read;
      if (filter === "bookings") return n.type.startsWith("booking");
      if (filter === "messages") return n.type === "new_message";
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800/60 rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black">
            <Bell size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Campus handovers, booking alerts, and direct messages
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#161f30] p-1 rounded-2xl mb-5 text-xs font-bold w-fit">
        {[
          { id: "all", label: "All Activity" },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "bookings", label: "Bookings" },
          { id: "messages", label: "Messages" },
        ].map((tab) => {
          const isSelected = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              {Boolean(tab.count) && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* NOTIFICATIONS LIST */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-12 rounded-3xl text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-3">
            <Bell size={26} />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {filter === "unread" ? "No unread alerts" : "All caught up!"}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {filter === "unread"
              ? "You have acknowledged all your campus notifications."
              : "You will be alerted about booking requests, approvals, handovers, and return reminders here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const meta = getNotificationMeta(n.type);
            const Icon = meta.icon;

            return (
              <div
                key={n._id}
                onClick={() => handleClickNotification(n)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 hover:shadow-md hover:-translate-y-0.5 group ${
                  n.read
                    ? "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white"
                    : "bg-orange-500/5 dark:bg-[#182133] border-orange-300/60 dark:border-orange-500/30 text-slate-900 dark:text-white ring-1 ring-orange-500/10 shadow-xs"
                }`}
              >
                {/* Type Icon Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.cls}`}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.cls}`}
                    >
                      {meta.label}
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                    )}
                  </div>

                  <p className="font-semibold text-sm leading-snug text-slate-900 dark:text-slate-100">
                    {n.message}
                  </p>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-orange-500 group-hover:text-orange-600 transition-colors pt-1">
                  <span>View</span>
                  <ExternalLink size={13} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;