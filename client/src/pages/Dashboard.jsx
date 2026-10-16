import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Repeat,
  ArrowUpRight,
  Bell,
  Clock,
  AlertTriangle,
  Plus,
  MessageSquare,
  ChevronRight,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { getMyRequests, getReceivedRequests } from "../api/bookings.api";
import { getNotifications } from "../api/notfications.api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState([]);
  const [received, setReceived] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mine, rec, notif] = await Promise.all([
          getMyRequests(),
          getReceivedRequests(),
          getNotifications(),
        ]);

        setMyBookings(mine.bookings || []);
        setReceived(rec.bookings || []);
        setNotifications(notif.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeBorrows = myBookings.filter((b) => b.status === "approved");
  const lentItems = received.filter((b) => b.status === "approved");
  const pendingRequests = received.filter((b) => b.status === "pending");

  const isOverdue = (b) => {
    return b.status === "approved" && new Date(b.endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* 🚀 Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Student Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Campus Activity Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/add-item")}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>List Gear</span>
          </button>
          <button
            onClick={() => navigate("/bookings")}
            className="px-4 py-2 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Bookings
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="px-4 py-2 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages</span>
          </button>
        </div>
      </div>

      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Borrows
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {activeBorrows.length}
          </div>
          <div className="text-[11px] text-slate-400">
            {activeBorrows.some(isOverdue) ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                ⚠ Overdue item pending return
              </span>
            ) : (
              "All returns on schedule"
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Items Lent Out
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lentItems.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Currently borrowed by classmates
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Awaiting your approval
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Recent Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {notifications.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Campus booking notifications
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Bookings & Requests */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Bookings (Items Borrowed) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Active Borrows ({activeBorrows.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Items you have currently checked out
                </p>
              </div>
              <button
                onClick={() => navigate("/bookings")}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>All History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeBorrows.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You have no items checked out right now.
                </p>
                <button
                  onClick={() => navigate("/browse")}
                  className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Browse Campus Listings →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBorrows.map((b) => {
                  const overdue = isOverdue(b);
                  return (
                    <div
                      key={b._id}
                      className={
                        "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all " +
                        (overdue
                          ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60"
                          : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800")
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                          {b.item?.images?.[0] ? (
                            <img
                              src={b.item.images[0]}
                              alt={b.item?.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              Gear
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                            {b.item?.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due {new Date(b.endDate).toLocaleDateString()}</span>
                            </span>
                            {overdue && (
                              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Overdue</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => navigate(`/item/${b.item?._id}`)}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          View Item
                        </button>
                        <button
                          onClick={() => navigate(`/chat/${b.owner?._id || b.owner}`)}
                          className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Requests On My Items */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Incoming Item Requests ({received.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Peer requests to borrow your gear
                </p>
              </div>
              <button
                onClick={() => navigate("/bookings")}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {received.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No incoming borrow requests on your listings yet.
              </div>
            ) : (
              <div className="space-y-3">
                {received.slice(0, 4).map((b) => (
                  <div
                    key={b._id}
                    className="p-3.5 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {b.item?.title}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Requested by <span className="font-semibold text-slate-700 dark:text-slate-300">{b.borrower?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize " +
                          (b.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : b.status === "pending"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20")
                        }
                      >
                        {b.status}
                      </span>
                      <button
                        onClick={() => navigate("/bookings")}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notifications & Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Recent Alerts
              </h3>
              <button
                onClick={() => navigate("/notifications")}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
              >
                View all
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No alerts yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n._id}
                    className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl text-xs space-y-1"
                  >
                    <div className="text-slate-800 dark:text-slate-200 leading-snug">
                      {n.message}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campus Community Guidelines Card */}
          <div className="border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl p-5 space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Campus Safety Rule</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Always verify item condition at pickup. If returning high-value items, meet inside the Central Library or Canteen zone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;