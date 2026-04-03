import { useEffect, useState } from "react";
import {
  getNotifications,
  markAllRead,
} from '../api/notfications.api';

const Notifications = () => {
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
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">Notifications</h1>

        <button
          onClick={handleMarkAll}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Mark all read
        </button>
      </div>

      {/* LIST */}
      {notifications.length === 0 ? (
        <div>No notifications yet</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded shadow ${
                n.read
                  ? "bg-white"
                  : "bg-orange-50 border-l-4 border-orange-500"
              }`}
            >
              <div className="font-semibold">{n.message}</div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;