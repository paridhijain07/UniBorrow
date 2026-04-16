import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, Moon, Sun } from "lucide-react";
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
      const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
      avatarUrl = `${baseUrl}${avatarUrl}`;
    }
    return avatarUrl;
  }, [user?.avatar]);

  return (
    <header className="bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold tracking-wide text-white text-xl hover:opacity-80 transition-opacity"
            onClick={() => setMobileOpen(false)}
          >
            <img src={logo} alt="UniBorrow Logo" className="h-8 w-auto object-contain drop-shadow-md" />
            UniBorrow
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {isAuthed && (
            <Link
              to="/dashboard"
              className="text-white/80 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-white/80 hover:text-white p-1 flex items-center justify-center mr-1 transition-all duration-200 hover:rotate-12"
            aria-label="Toggle Dark Mode"
          >
            {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
          </button>
          
          {isAuthed ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  className="text-white/80 hover:text-white"
                  onClick={() => setNotifOpen((v) => !v)}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f97316] text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-[340px] bg-white/80 dark:bg-[#18181b]/90 backdrop-blur-md border border-white/40 dark:border-[#3f3f46] rounded-2xl shadow-lg p-4 z-50">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#0f172a] dark:text-[#f4f4f5]">Notifications</p>
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[#f97316] font-semibold"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="mt-3 space-y-3 max-h-[320px] overflow-auto">
                      {latestNotifications.length === 0 ? (
                        <div className="text-[#64748b] dark:text-[#a1a1aa] text-sm">
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
                                "p-3 rounded-xl border " +
                                (!n.read
                                  ? "border-[#f97316]/50 bg-orange-50/50 dark:bg-[#f97316]/10"
                                  : "border-gray-200 dark:border-[#3f3f46] bg-white/60 dark:bg-[#1f1f22]/60")
                              }
                            >
                              <div className="text-sm font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                                {n.type.replaceAll("_", " ")}
                              </div>
                              <div className="text-sm text-[#64748b] dark:text-[#d4d4d8] mt-1">
                                {n.message}
                              </div>
                              <div className="text-xs text-[#64748b] dark:text-[#a1a1aa] mt-2">
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        className="text-[#f97316] font-semibold"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        View all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="flex items-center gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <img
                  src={userAvatar || "/default-avatar.svg"}
                  alt="User avatar"
                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="text-white/80 hover:text-white font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/80 hover:text-white font-semibold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-4 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden text-white/80 hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-4 space-y-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block text-[#0f172a] font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {isAuthed ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-[#0f172a] font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="block text-[#f97316] font-semibold w-full text-left"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-[#0f172a] font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold rounded-xl px-4 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

