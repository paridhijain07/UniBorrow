import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import {
  getNotifications,
  markAllRead,
} from '../api/notfications.api';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (n.relatedBooking) {
      navigate("/bookings");
    } else if (n.relatedItem) {
      navigate(`/item/${n.relatedItem}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-3 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="text-[#f97316]" size={24} />
          <h1 className="text-3xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">
            Notifications
          </h1>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* LIST */}
      {notifications.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#18181b]/80 border border-gray-200 dark:border-[#27272a] p-12 rounded-3xl text-center">
          <Bell size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <div className="text-lg font-bold text-[#0f172a] dark:text-[#f4f4f5]">
            No notifications yet
          </div>
          <p className="text-sm text-[#64748b] dark:text-[#a1a1aa] mt-1">
            You will be alerted about booking requests, approvals, and reminders here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClickNotification(n)}
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                n.relatedBooking || n.relatedItem ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
              } ${
                n.read
                  ? "bg-white/80 dark:bg-[#18181b]/80 border-gray-200 dark:border-[#27272a] text-[#0f172a] dark:text-[#f4f4f5]"
                  : "bg-orange-50/90 dark:bg-[#271d18]/90 border-orange-200 dark:border-orange-950 text-[#0f172a] dark:text-[#f4f4f5]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm md:text-base leading-snug">
                    {n.message}
                  </div>
                  <div className="text-xs text-[#64748b] dark:text-[#a1a1aa] mt-1.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                {(n.relatedBooking || n.relatedItem) && (
                  <span className="text-xs font-bold text-[#f97316] flex items-center gap-0.5 whitespace-nowrap pt-0.5">
                    View <ExternalLink size={12} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;