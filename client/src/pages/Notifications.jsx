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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Activity and booking updates</p>
          </div>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* LIST */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-12 rounded-3xl text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Bell size={26} />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            All caught up!
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            You will be alerted about booking requests, approvals, handovers, and return reminders here.
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
                  ? "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white"
                  : "bg-orange-500/5 dark:bg-[#1a2234] border-orange-200 dark:border-orange-500/30 text-slate-900 dark:text-white ring-1 ring-orange-500/10 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm md:text-base leading-snug">
                    {n.message}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-2">
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                    )}
                    <span>{new Date(n.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>

                {(n.relatedBooking || n.relatedItem) && (
                  <span className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 whitespace-nowrap pt-0.5 transition-colors">
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