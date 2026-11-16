import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, MessageSquare, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import logo from "../../assets/logo.png";
import { api } from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinks = [
  { to: "/browse", label: "Browse Items" },
  { to: "/add-item", label: "List an Item" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const isAuthed = Boolean(user?.id);
  const canFetchNotifications = isAuthed && Boolean(localStorage.getItem("token"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!canFetchNotifications) return;

    const run = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res?.data?.count ?? 0);
      } catch {
        // ignore
      }

      try {
        const res = await api.get("/notifications");
        const notifications = res?.data?.notifications;
        setLatestNotifications(
          Array.isArray(notifications) ? notifications.slice(0, 5) : []
        );
      } catch {
        // ignore
      }
    };

    run();
  }, [canFetchNotifications]);

  const handleLogout = () => {
    setNotifOpen(false);
    setMobileOpen(false);
    logout();
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setUnreadCount(0);
      setNotifOpen(false);
    } catch {
      // ignore
    }
  };

  const userAvatar = useMemo(() => {
    if (!user?.avatar) return "/default-avatar.svg";
    let avatarUrl = user.avatar;
    if (!avatarUrl.startsWith("http") && !avatarUrl.startsWith("data:") && !avatarUrl.startsWith("/")) {
      const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const baseUrl = rawApiUrl.replace(/\/api\/?$/, "");
      avatarUrl = `${baseUrl}${avatarUrl}`;
    }
    return avatarUrl;
  }, [user?.avatar]);

  return (
    <header className="bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-extrabold tracking-tight text-slate-900 dark:text-white text-xl group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="relative">
              <img src={logo} alt="UniBorrow Logo" className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>
            <span>
              Uni<span className="text-orange-500">Borrow</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 ml-1">
              Campus
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {isAuthed && (
            <Link
              to="/dashboard"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {mounted && (theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />)}
          </button>
          
          {isAuthed ? (
            <>
              {/* Messages Shortcut */}
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                aria-label="Messages"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Notifications Popover */}
              <div className="relative">
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                  onClick={() => setNotifOpen((v) => !v)}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-[340px] bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 z-50 ring-1 ring-black/5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Notifications</p>
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 max-h-[300px] overflow-auto">
                      {latestNotifications.length === 0 ? (
                        <div className="text-slate-400 dark:text-slate-500 text-xs py-4 text-center">
                          No notifications yet.
                        </div>
                      ) : (
                        latestNotifications.map((n) => (
                          <button
                            type="button"
                            key={n._id}
                            className="w-full text-left"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate("/notifications");
                            }}
                          >
                            <div
                              className={
                                "p-2.5 rounded-xl border transition-all text-xs " +
                                (!n.read
                                  ? "border-orange-500/30 bg-orange-50/70 dark:bg-orange-500/10"
                                  : "border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800")
                              }
                            >
                              <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                                {n.type.replaceAll("_", " ")}
                              </div>
                              <div className="text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {n.message}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      <button
                        type="button"
                        className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <button
                type="button"
                className="flex items-center gap-2 group p-0.5 rounded-full ring-2 ring-transparent hover:ring-orange-500 transition-all"
                onClick={() => navigate("/dashboard")}
                title="Open Dashboard"
              >
                <img
                  src={userAvatar || "/default-avatar.svg"}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium text-xs px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-medium text-sm px-3.5 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm rounded-xl px-4 py-2 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 active:scale-95"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="md:hidden text-slate-700 dark:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 animate-page-fade">
          <div className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block text-slate-800 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {isAuthed ? (
              <>
                <Link
                  to="/chat"
                  className="block text-slate-800 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  to="/dashboard"
                  className="block text-slate-800 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="block text-rose-600 dark:text-rose-400 font-semibold w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="block text-center text-slate-800 dark:text-slate-200 font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl px-4 py-2.5 shadow-md shadow-orange-500/20 text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

